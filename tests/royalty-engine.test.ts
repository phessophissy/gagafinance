import { describe, it, expect, beforeEach } from "vitest";
import { Cl, ClarityValue } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Royalty Engine Tests", () => {
    describe("Collection Registration", () => {
        it("should register collection successfully", () => {
            const { result } = simnet.callPublicFn(
                "royalty-engine",
                "register-collection",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.principal(wallet1),
                    Cl.uint(500), // 5% royalty
                ],
                deployer
            );
            expect(result).toBeOk(Cl.bool(true));
        });

        it("should fail registration by non-owner", () => {
            const { result } = simnet.callPublicFn(
                "royalty-engine",
                "register-collection",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.principal(wallet1),
                    Cl.uint(500),
                ],
                wallet1
            );
            expect(result).toBeErr(Cl.uint(300)); // ERR-NOT-AUTHORIZED
        });

        it("should fail with royalty too high", () => {
            const { result } = simnet.callPublicFn(
                "royalty-engine",
                "register-collection",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.principal(wallet1),
                    Cl.uint(3000), // 30% - too high
                ],
                deployer
            );
            expect(result).toBeErr(Cl.uint(306)); // ERR-ROYALTY-TOO-HIGH
        });
    });

    describe("Royalty Calculation", () => {
        it("should calculate royalty correctly", () => {
            simnet.callPublicFn(
                "royalty-engine",
                "register-collection",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.principal(wallet1),
                    Cl.uint(500), // 5%
                ],
                deployer
            );
            const { result } = simnet.callReadOnlyFn(
                "royalty-engine",
                "calculate-royalty",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.uint(1000000), // 1 STX
                ],
                deployer
            );
            expect(result).toBeOk(Cl.uint(50000)); // 0.05 STX (5%)
        });

        it("should return zero for unregistered collection", () => {
            const { result } = simnet.callReadOnlyFn(
                "royalty-engine",
                "calculate-royalty",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.uint(1000000),
                ],
                deployer
            );
            expect(result).toBeOk(Cl.uint(0));
        });
    });

    describe("Payout Breakdown", () => {
        it("should return correct payout breakdown", () => {
            simnet.callPublicFn(
                "royalty-engine",
                "register-collection",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.principal(wallet1),
                    Cl.uint(500), // 5%
                ],
                deployer
            );
            const { result } = simnet.callReadOnlyFn(
                "royalty-engine",
                "get-payout-breakdown",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.uint(1000000), // 1 STX sale price
                    Cl.uint(250),     // 2.5% protocol fee
                ],
                deployer
            );
            // royalty: 50000, protocol: 25000, seller: 925000
            expect(result).toBeOk(Cl.tuple({
                "royalty-amount": Cl.uint(50000),
                "royalty-recipient": Cl.principal(wallet1),
                "protocol-fee": Cl.uint(25000),
                "seller-amount": Cl.uint(925000),
            }));
        });
    });

    describe("Royalty Updates", () => {
        it("should update royalty bps", () => {
            simnet.callPublicFn(
                "royalty-engine",
                "register-collection",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.principal(wallet1),
                    Cl.uint(500),
                ],
                deployer
            );
            const { result } = simnet.callPublicFn(
                "royalty-engine",
                "update-royalty-bps",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.uint(750), // 7.5%
                ],
                deployer
            );
            expect(result).toBeOk(Cl.bool(true));
        });

        it("should update royalty recipient", () => {
            simnet.callPublicFn(
                "royalty-engine",
                "register-collection",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.principal(wallet1),
                    Cl.uint(500),
                ],
                deployer
            );
            const { result } = simnet.callPublicFn(
                "royalty-engine",
                "update-royalty-recipient",
                [
                    Cl.contractPrincipal(deployer, "nft"),
                    Cl.principal(wallet2),
                ],
                deployer
            );
            expect(result).toBeOk(Cl.bool(true));
        });
    });

    describe("Max Royalty Cap", () => {
        it("should return max royalty bps", () => {
            const { result } = simnet.callReadOnlyFn(
                "royalty-engine",
                "get-max-royalty-bps",
                [],
                deployer
            );
            expect(result).toBeOk(Cl.uint(2500)); // 25% max
        });
    });
});
