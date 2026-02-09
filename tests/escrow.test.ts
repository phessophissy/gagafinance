import { describe, it, expect, beforeEach } from "vitest";
import { Cl, ClarityValue } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Escrow Contract Tests", () => {
    describe("Configuration", () => {
        it("should set marketplace contract", () => {
            const { result } = simnet.callPublicFn(
                "escrow",
                "set-marketplace-contract",
                [Cl.contractPrincipal(deployer, "marketplace-core")],
                deployer
            );
            expect(result).toBeOk(Cl.bool(true));
        });

        it("should set auction contract", () => {
            const { result } = simnet.callPublicFn(
                "escrow",
                "set-auction-contract",
                [Cl.contractPrincipal(deployer, "auction")],
                deployer
            );
            expect(result).toBeOk(Cl.bool(true));
        });

        it("should fail config by non-owner", () => {
            const { result } = simnet.callPublicFn(
                "escrow",
                "set-marketplace-contract",
                [Cl.contractPrincipal(deployer, "marketplace-core")],
                wallet1
            );
            expect(result).toBeErr(Cl.uint(200)); // ERR-NOT-AUTHORIZED
        });
    });

    describe("Pausability", () => {
        it("should pause contract", () => {
            const { result } = simnet.callPublicFn(
                "escrow",
                "set-paused",
                [Cl.bool(true)],
                deployer
            );
            expect(result).toBeOk(Cl.bool(true));
        });

        it("should check pause status", () => {
            const { result } = simnet.callReadOnlyFn(
                "escrow",
                "is-contract-paused",
                [],
                deployer
            );
            expect(result).toBeOk(Cl.bool(false));
        });
    });

    describe("Emergency Mode", () => {
        it("should enable emergency mode", () => {
            const { result } = simnet.callPublicFn(
                "escrow",
                "set-emergency-mode",
                [Cl.bool(true)],
                deployer
            );
            expect(result).toBeOk(Cl.bool(true));
        });

        it("should check emergency mode status", () => {
            const { result } = simnet.callReadOnlyFn(
                "escrow",
                "is-emergency-mode",
                [],
                deployer
            );
            expect(result).toBeOk(Cl.bool(false));
        });
    });

    describe("NFT Escrow Tracking", () => {
        it("should report NFT not escrowed initially", () => {
            const result = simnet.callReadOnlyFn(
                "escrow",
                "is-nft-escrowed",
                [Cl.contractPrincipal(deployer, "nft"), Cl.uint(1)],
                deployer
            );
            expect(result.result).toStrictEqual(Cl.bool(false));
        });
    });

    describe("STX Balance Tracking", () => {
        it("should return zero balance initially", () => {
            const { result } = simnet.callReadOnlyFn(
                "escrow",
                "get-stx-balance",
                [Cl.principal(wallet1)],
                deployer
            );
            expect(result).toBeOk(Cl.uint(0));
        });

        it("should return zero total escrowed", () => {
            const { result } = simnet.callReadOnlyFn(
                "escrow",
                "get-total-escrowed-stx",
                [],
                deployer
            );
            expect(result).toBeOk(Cl.uint(0));
        });
    });
});
