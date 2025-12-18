/**
 * Validate Ethereum address
 * - Must start with 0x
 * - Must be 42 characters total
 * - Must be valid hex
 */
export const validateEthAddress = (address) => {
  if (!address) {
    return { valid: false, error: 'Please enter an address' };
  }

  const trimmed = address.trim();

  if (!trimmed.startsWith('0x')) {
    return { valid: false, error: 'Ethereum address must start with 0x' };
  }

  if (trimmed.length !== 42) {
    return { valid: false, error: 'Ethereum address must be 42 characters' };
  }

  const hexRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!hexRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid Ethereum address format' };
  }

  return { valid: true, address: trimmed };
};

/**
 * Validate Solana address
 * - Base58 encoded
 * - 32-44 characters
 * - No 0, O, I, l (not in Base58 alphabet)
 */
export const validateSolAddress = (address) => {
  if (!address) {
    return { valid: false, error: 'Please enter an address' };
  }

  const trimmed = address.trim();

  // Solana addresses are 32-44 characters
  if (trimmed.length < 32 || trimmed.length > 44) {
    return { valid: false, error: 'Solana address must be 32-44 characters' };
  }

  // Base58 alphabet (no 0, O, I, l)
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  if (!base58Regex.test(trimmed)) {
    return { valid: false, error: 'Invalid Solana address format' };
  }

  return { valid: true, address: trimmed };
};

/**
 * Validate address based on chain
 * chain: 'ethereum' or 'solana'
 */
export const validateAddress = (address, chain = 'ethereum') => {
  if (chain === 'solana') {
    return validateSolAddress(address);
  }
  return validateEthAddress(address);
};

export default { validateAddress, validateEthAddress, validateSolAddress };
