import { isAddress } from "ethers";

export const validateAddress = (address) => {
    if (!address) return { valid: false, error: 'Address required '};

    const trimmed = address.trim();

    if (!isAddress(trimmed)) {
        return { valid: false, error: 'Invalid Ethereum address '};
    }

    return { valid: true, address: trimmed };
}