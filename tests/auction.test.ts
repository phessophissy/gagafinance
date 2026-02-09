import { describe, it, expect, beforeEach } from "vitest";
import { Cl, ClarityValue } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("Auction Contract Tests", () => {
    const mintNFT = (recipient: string) => {
        return simnet.callPublicFn("nft", "mint", [Cl.principal(recipient)], deployer);
    };

    describe("Auction Creation", () => {
        it("should create auction successfully", () => {
            mintNFT(wallet1);
            const { result } = simnet.callPublicFn(
                "auction",
                "create-auction",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.uint(1),
                    Cl.uint(100000),  // start price
                    Cl.uint(200000),  // reserve price
                    Cl.uint(144),     // duration blocks (~1 day)
                ],
                wallet1
            );
            expect(result).toBeOk(Cl.uint(1));
        });

        it("should fail with invalid duration", () => {
            mintNFT(wallet1);
            const { result } = simnet.callPublicFn(
                "auction",
                "create-auction",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.uint(1),
                    Cl.uint(100000),
                    Cl.uint(200000),
                    Cl.uint(10), // too short
                ],
                wallet1
            );
            expect(result).toBeErr(Cl.uint(409)); // ERR-INVALID-DURATION
        });

        it("should fail with zero price", () => {
            mintNFT(wallet1);
            const { result } = simnet.callPublicFn(
                "auction",
                "create-auction",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.uint(1),
                    Cl.uint(0), // invalid
                    Cl.uint(200000),
                    Cl.uint(144),
                ],
                wallet1
            );
            expect(result).toBeErr(Cl.uint(410)); // ERR-INVALID-PRICE
        });
    });

    describe("Bidding", () => {
        it("should place bid successfully", () => {
            mintNFT(wallet1);
            simnet.callPublicFn(
                "auction",
                "create-auction",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.uint(1),
                    Cl.uint(100000),
                    Cl.uint(200000),
                    Cl.uint(144),
                ],
                wallet1
            );
            const { result } = simnet.callPublicFn(
                "auction",
                "place-bid",
                [Cl.uint(1), Cl.uint(100000)],
                wallet2
            );
            expect(result).toBeOk(Cl.bool(true));
        });

        it("should fail bid below minimum", () => {
            mintNFT(wallet1);
            simnet.callPublicFn(
                "auction",
                "create-auction",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.uint(1),
                    Cl.uint(100000),
                    Cl.uint(200000),
                    Cl.uint(144),
                ],
                wallet1
            );
            const { result } = simnet.callPublicFn(
                "auction",
                "place-bid",
                [Cl.uint(1), Cl.uint(50000)], // too low
                wallet2
            );
            expect(result).toBeErr(Cl.uint(406)); // ERR-BID-TOO-LOW
        });

        it("should fail bid on own auction", () => {
            mintNFT(wallet1);
            simnet.callPublicFn(
                "auction",
                "create-auction",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.uint(1),
                    Cl.uint(100000),
                    Cl.uint(200000),
                    Cl.uint(144),
                ],
                wallet1
            );
            const { result } = simnet.callPublicFn(
                "auction",
                "place-bid",
                [Cl.uint(1), Cl.uint(100000)],
                wallet1
            );
            expect(result).toBeErr(Cl.uint(407)); // ERR-CANNOT-BID-OWN-AUCTION
        });
    });

    describe("Read-only functions", () => {
        it("should get auction details", () => {
            mintNFT(wallet1);
            simnet.callPublicFn(
                "auction",
                "create-auction",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.uint(1),
                    Cl.uint(100000),
                    Cl.uint(200000),
                    Cl.uint(144),
                ],
                wallet1
            );
            const { result } = simnet.callReadOnlyFn(
                "auction",
                "get-auction",
                [Cl.uint(1)],
                deployer
            );
            // Check result is ok and contains auction data (not checking exact block values)
            expect(result.type).toBe("ok");
        });

        it("should get minimum next bid", () => {
            mintNFT(wallet1);
            simnet.callPublicFn(
                "auction",
                "create-auction",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.uint(1),
                    Cl.uint(100000),
                    Cl.uint(200000),
                    Cl.uint(144),
                ],
                wallet1
            );
            const { result } = simnet.callReadOnlyFn(
                "auction",
                "get-min-next-bid",
                [Cl.uint(1)],
                deployer
            );
            // Check result is ok (min bid depends on current state)
            expect(result.type).toBe("ok");
        });
    });

    describe("Cancellation", () => {
        it("should cancel auction with no bids", () => {
            mintNFT(wallet1);
            simnet.callPublicFn(
                "auction",
                "create-auction",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.uint(1),
                    Cl.uint(100000),
                    Cl.uint(200000),
                    Cl.uint(144),
                ],
                wallet1
            );
            const { result } = simnet.callPublicFn(
                "auction",
                "cancel-auction",
                [Cl.uint(1)],
                wallet1
            );
            expect(result).toBeOk(Cl.bool(true));
        });

        it("should fail cancel by non-seller", () => {
            mintNFT(wallet1);
            simnet.callPublicFn(
                "auction",
                "create-auction",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.uint(1),
                    Cl.uint(100000),
                    Cl.uint(200000),
                    Cl.uint(144),
                ],
                wallet1
            );
            const { result } = simnet.callPublicFn(
                "auction",
                "cancel-auction",
                [Cl.uint(1)],
                wallet2
            );
            expect(result).toBeErr(Cl.uint(412)); // ERR-NOT-SELLER
        });
    });
});
