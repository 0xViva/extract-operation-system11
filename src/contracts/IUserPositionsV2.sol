// SPDX-License-Identifier: GPL-2.0
pragma solidity 0.8.4;
import "./IStrategyMapV1.sol";

interface IUserPositionsV2 {
    // ##### Structs
    struct TokenMovement {
        address token;
        uint256 amount;
    }

    struct StrategyRecord {
        uint256 strategyId;
        uint256 timestamp;
    }
    struct MigrateStrategy {
        address user;
        TokenMovement[] tokens;
    }
    struct WithdrawAllAndClaimResponse {
        uint256[] tokenAmounts;
        uint256 ethWithdrawn;
        uint256 ethClaimed;
        uint256 biosClaimed;
    }

    // ##### Events
    event EnterStrategy(uint256 indexed id, address indexed user, TokenMovement[] tokens);
    event ExitStrategy(uint256 indexed id, address indexed user, TokenMovement[] tokens);
    event Deposit(address indexed user, address[] tokens, uint256[] tokenAmounts, uint256 ethAmount);
    event Pause(bool isPaused);

    // ##### Functions

    /// @notice User is allowed to deposit whitelisted tokens
    /// @param depositor Address of the account depositing
    /// @param tokens Array of token the token addresses
    /// @param amounts Array of token amounts
    /// @param ethAmount The amount of ETH sent with the deposit
    /// @param migration flag if this is a migration from the old system
    function deposit(
        address depositor,
        address[] memory tokens,
        uint256[] memory amounts,
        uint256 ethAmount,
        bool migration
    ) external;

    /// @notice User is allowed to withdraw tokens
    /// @param recipient The address of the user withdrawing
    /// @param tokens Array of token the token addresses
    /// @param amounts Array of token amounts
    /// @param withdrawWethAsEth Boolean indicating whether should receive WETH balance as ETH
    function withdraw(
        address recipient,
        address[] memory tokens,
        uint256[] memory amounts,
        bool withdrawWethAsEth
    ) external returns (uint256 ethWithdrawn);

    /// @notice Allows a user to withdraw entire balances of the specified tokens and claim rewards
    /// @param recipient The address of the user withdrawing tokens
    /// @param tokens Array of token address that user is exiting positions from
    /// @param strategies Array of strategy IDs that user is claiming rewards from
    /// @param withdrawWethAsEth Boolean indicating whether should receive WETH balance as ETH
    /// @return _withdrawAllAndClaimResponse
    /// /// WithdrawAllAndClaimResponse.tokenAmounts The amounts of each token being withdrawn
    /// /// WithdrawAllAndClaimResponse.ethWithdrawn The amount of ETH being withdrawn
    /// /// WithdrawAllAndClaimResponse.ethClaimed The amount of ETH being claimed from rewards
    /// /// WithdrawAllAndClaimResponse.biosClaimed The amount of BIOS being claimed from rewards
    function withdrawAllAndClaim(
        address recipient,
        address[] memory tokens,
        uint256[] calldata strategies,
        bool withdrawWethAsEth
    ) external returns (WithdrawAllAndClaimResponse memory _withdrawAllAndClaimResponse);

    /// @param user The address of the user claiming ETH rewards
    /// @param strategies An array of strategyIDs to claim rewards for
    function claimEthRewards(address user, uint256[] calldata strategies) external returns (uint256 ethClaimed);

    /// @param asset Address of the ERC20 token contract
    /// @return The total balance of the asset deposited in the system
    function totalTokenBalance(address asset) external view returns (uint256);

    /// @notice Returns the amount that a user has deposited locally, but that isn't in a strategy
    /// @param asset Address of the ERC20 token contract
    /// @param account Address of the user account
    function userTokenBalance(address asset, address account) external view returns (uint256);

    /// @notice Returns the amount that a user can use for strategies (local balance + interconnect balance - deployed)
    /// @param asset Address of the ERC20 token contract
    /// @param account Address of the user account
    function userDeployableBalance(address asset, address account) external view returns (uint256);

    /// @notice Returns the amount that a user has interconnected
    /// @param asset Address of the ERC20 token contract
    /// @param account Address of the user account
    function userInterconnectBalance(address asset, address account) external view returns (uint256);

    /**
    @notice Adds a user's funds to a strategy to be deployed
    @param strategyID  The strategy to enter
    @param tokens  The tokens and amounts to enter into the strategy
     */
    function enterStrategy(uint256 strategyID, TokenMovement[] calldata tokens) external;

    function _remoteStrategyExecution(
        uint256 strategyID,
        address user,
        TokenMovement[] calldata tokens,
        bool enterStrat // true to enter, false to exit
    ) external;

    /**
    @notice Marks a user's funds as withdrawable
    @param strategyID  The strategy to withdrawfrom
    @param tokens  The tokens and amounts to withdraw
     */
    function exitStrategy(uint256 strategyID, TokenMovement[] calldata tokens) external;

    /**
    @notice Updates a user's local balance. Only called by controlled contracts or relayer
    @param assets list of tokens to update
    @param account user 
    @param amounts list of amounts to update 
     */
    function updateUserTokenBalances(
        address[] calldata assets,
        address account,
        uint256[] calldata amounts,
        bool[] memory add
    ) external;

    /**
    @notice Updates a user's interconnected balance. Only called by controlled contracts or relayer
    @param assets list of tokens to update
    @param account user 
    @param amounts list of amounts to update 
     */
    function updateUserInterconnectBalances(
        address[] memory assets,
        address account,
        uint256[] memory amounts,
        bool[] memory add
    ) external;

    /**
    @notice returns the amount of a given token a user has invested in a given strategy
    @param id  the strategy id
    @param token  the token address
    @param user  the user who holds the funds
    @return amount  the amount of token that the user has invested in the strategy 
     */
    function getUserStrategyBalanceByToken(
        uint256 id,
        address token,
        address user
    ) external view returns (uint256 amount);

    /**
    @notice Returns the amount of a given token that a user has invested across all strategies
    @param token  the token address
    @param user  the user holding the funds
    @return amount  the amount of tokens the user has invested across all strategies
     */
    function getUserInvestedAmountByToken(address token, address user) external view returns (uint256 amount);

    /**
    @notice Returns a user's balances for requested strategies, and the users total invested amounts for each token requested
    @param user  the user to request for
    @param _strategies  the strategies to get balances for
    @param _tokens  the tokens to get balances for
    @return userStrategyBalances  The user's invested funds in the strategies
    @return userBalance  User total token balances
     */
    function getUserBalances(
        address user,
        uint256[] calldata _strategies,
        address[] calldata _tokens
    )
        external
        view
        returns (
            IStrategyMapV1.StrategyBalance[] memory userStrategyBalances,
            IStrategyMapV1.GeneralBalance[] memory userBalance
        );
}
