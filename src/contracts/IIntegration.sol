// SPDX-License-Identifier: GPL-2.0
pragma solidity 0.8.4;

interface IIntegration {
    event Deploy(address token, uint256 amount);
    event HarvestYield(address token, uint256 amount);
    event Deposit(address token, uint256 amount);
    event Withdraw(address token, uint256 amount);

    /**
     * Used by YieldManager to deposit funds.
     * @param tokenAddress The address of the deposited token
     * @param amount The amount being deposited
     */
    function deposit(address tokenAddress, uint256 amount) external;

    /**
     * Used by YieldManager to withdraw funds.
     * @param tokenAddress The address of the withdrawal token
     * @param amount The amount being withdrawn
     */
    function withdraw(address tokenAddress, uint256 amount) external;

    /**
     * Used by YieldManager to deploy funds.
     * @dev Deploys all tokens held in the integration contract to the integrated protocol
     */
    function deploy() external;

    /**
     * Used by YieldManager to harvest funds.
     * @dev Harvests token yield from the integration
     */
    function harvestYield() external;

    /**
     * Get the integration's balance of a token.
     * @dev has been deposited to the integration contract
     * @dev This returns the total amount of the underlying token that
     * @param tokenAddress The address of the deployed token
     * @return The amount of the underlying token that can be withdrawn
     */
    function getBalance(address tokenAddress) external view returns (uint256);

    /**
     * Returns the total amount of yield awaing to be harvested
     * using the relevant integration's own function
     * @param tokenAddress The token to get the pending yield for
     * @return amount The amount of available yield for the specified token
     */
    function getPendingYield(address tokenAddress) external view returns (uint256 amount);
}
