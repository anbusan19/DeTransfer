/// Simple recipient-only access policy for Seal
/// This module provides a seal_approve function that allows decryption
/// only if the transaction sender matches the recipient ID (address).
module seal_access_policy::simple_recipient;

use sui::tx_context::TxContext;
use sui::bcs;

/// Access policy: Only the recipient (whose address matches the ID) can decrypt
/// 
/// This function is called by Seal key servers to verify access.
/// It checks if the transaction sender matches the recipient ID.
/// 
/// # Arguments
/// * `id` - The recipient address as a vector of bytes (32 bytes for Sui address)
/// * `ctx` - Transaction context
/// 
/// # Aborts
/// * Aborts with code 1 if the sender does not match the recipient ID
#[allow(lint(public_entry))]
public entry fun seal_approve(id: vector<u8>, ctx: &TxContext) {
    let sender = tx_context::sender(ctx);
    
    // Convert sender address to bytes for comparison
    // Sui addresses are 32 bytes when serialized with BCS
    let sender_bytes = bcs::to_bytes(&sender);
    
    // Check if sender matches the recipient ID
    // Both should be 32-byte Sui addresses
    assert!(sender_bytes == id, 1);
}

