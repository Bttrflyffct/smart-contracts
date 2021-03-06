pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./TokenStorage.sol";

/**
 * @title Mintable token
 * @dev Simple ERC20 Token example, with mintable token creation
 * @dev Issue: * https://github.com/OpenZeppelin/openzeppelin-solidity/issues/120
 * Based on code by TokenMarketNet: https://github.com/TokenMarketNet/ico/blob/master/contracts/MintableToken.sol
 */

library MintableTokenLib {

    using SafeMath for uint;

    event Mint(address indexed to, uint amount);
    event Burn(address indexed from, uint amount);
    event Transfer(address indexed from, address indexed to, uint value);

    /**
     * @dev Mints new tokens.
     * @param db Token storage to operate on.
     * @param to The address that will recieve the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(
        TokenStorage db, 
        address to, 
        uint amount
    ) 
        internal 
        returns (bool) 
    {
        db.addBalance(to, amount);
        emit Mint(to, amount);
        emit Transfer(0x0, to, amount);
        return true;
    }

    /**
     * @dev Burns tokens.
     * @param db Token storage to operate on.
     * @param from The address holding tokens.
     * @param amount The amount of tokens to burn.
     */
    function burn(
        TokenStorage db, 
        address from, 
        uint amount
    ) 
        internal
        returns (bool) 
    {
        db.subBalance(from, amount);
        emit Burn(from, amount);
        return true;
    }

}
