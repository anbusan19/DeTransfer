"use client";

import { SealClient } from "@mysten/seal";
import { walrusClient } from "../walrus/client";

/**
 * Seal package configuration for testnet
 * Using 'simple_recipient' access policy - recipient-only decryption
 */
export const SEAL_CONFIG = {
    PACKAGE_ID: "0xd1d471dd362206f61194c711d9dfcd1f8fd2d3e44df102efc15fa07332996247",
    MODULE: "simple_recipient",
    KEY_SERVERS: [
        { objectId: "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75", weight: 1 },
        { objectId: "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8", weight: 1 },
    ],
};

/**
 * Seal client initialized with testnet key servers
 */
export const sealClient = new SealClient({
    suiClient: walrusClient,
    serverConfigs: SEAL_CONFIG.KEY_SERVERS,
});
