// SPDX-License-Identifier: GPL-2.0
pragma solidity 0.8.4;

import "./IIntegration.sol";
import "./IUserPositionsV2.sol";

interface IStrategyMapV1 {
    // #### Structs
    struct Integration {
        address integration;
        uint32 ammPoolID;
    }
    struct Token {
        uint256 integrationPairIdx;
        address token;
        uint32 weight;
    }

    struct TokenDeploy {
        address integration;
        uint32 ammPoolID;
        address token;
        uint256 amount;
    }

    struct Strategy {
        string name;
        Integration[] integrations;
        Token[] tokens;
        mapping(address => bool) availableTokens;
        mapping(address => uint256) maximumCap;
    }

    struct StrategySummary {
        string name;
        Integration[] integrations;
        Token[] tokens;
    }

    struct StrategyBalance {
        uint256 strategyID;
        GeneralBalance[] tokens;
    }

    struct GeneralBalance {
        address token;
        uint256 balance;
    }

    struct ClosablePosition {
        address integration;
        uint32 ammPoolID;
        uint256 amount;
    }

    struct ReplaceIntegrationParams {
        Integration newIntegration;
        address token;
        uint256 oldIntegrationIndex;
        uint32[] weightAmounts;
        uint256[] weightTokenIndexes;
    }

    // #### Events
    event NewStrategy(uint256 indexed id, Integration[] integrations, Token[] tokens, string name);
    event UpdateName(uint256 indexed id, string name);
    event DeleteStrategy(uint256 indexed id);
    event IntegrationWeightAdjustment(
        uint256 strategyId,
        uint256 sourceIndex,
        uint256 destinationIndex,
        uint32 amount,
        bool rebalance
    );
    event RemoveIntegration(uint256 strategyId, uint256 integrationIndex, address token);
    event AddIntegration(uint256 strategyId, Integration integration, address token);

    // #### Functions
    /**
     @notice Adds a new strategy to the list of available strategies
     @param name  the name of the new strategy
     @param integrations  the integrations and weights that form the strategy
     @param maxCap  The maximum amount investable in a strategy
     */
    function addStrategy(
        string calldata name,
        Integration[] calldata integrations,
        Token[] calldata tokens,
        uint256[] memory maxCap
    ) external;

    /**
    @notice Updates the strategy name
    @param name  the new name
     */
    function updateName(uint256 id, string calldata name) external;

    function addPairToStrategy(
        uint256 strategyId,
        Integration calldata integration,
        address token
    ) external;

    /// @dev Changes weights of integrations, optionally rebalancing the integrations so that current fund allocation reflects new weights
    function movePairWeight(
        uint256 strategyId,
        uint256 sourceIndex,
        uint256 destinationIndex,
        int256 vectorAmount,
        uint32 amount,
        bool rebalance
    ) external;

    function removePairFromStrategy(
        uint256 strategyId,
        uint256 integrationIndex,
        address token
    ) external;

    /**
    @notice Deletes a strategy
    @dev This can only be called successfully if the strategy being deleted doesn't have any assets invested in it.
    @dev To delete a strategy with funds deployed in it, first update the strategy so that the existing tokens are no longer available in the strategy, then delete the strategy. This will unwind the users positions, and they will be able to withdraw their funds.
    @param id  the strategy to delete
     */
    function deleteStrategy(uint256 id) external;

    /**
    @notice Increases the amount of a set of tokens in a strategy
    @param id  the strategy to deposit into
    @param tokens  the tokens to deposit
     */
    function increaseStrategy(uint256 id, IUserPositionsV2.TokenMovement[] calldata tokens) external;

    /**
    @notice Decreases the amount of a set of tokens invested in a strategy
    @param id  the strategy to withdraw assets from
    @param tokens  details of the tokens being deposited
     */
    function decreaseStrategy(uint256 id, IUserPositionsV2.TokenMovement[] calldata tokens) external;

    /**
    @notice Getter function to return the nested arrays as well as the name
    @param id  the strategy to return
     */
    function getStrategy(uint256 id) external view returns (StrategySummary memory);

    /**
    @notice Decreases the deployable amount after a deployment/withdrawal
    @param integration  the integration that was changed
    @param poolID  the pool within the integration that handled the tokens
    @param token  the token to decrease for
    @param amount  the amount to reduce the vector by
     */
    function decreaseDeployAmountChange(
        address integration,
        uint32 poolID,
        address token,
        uint256 amount
    ) external;

    /**
    @notice Returns the amount of a given token currently invested in a strategy
    @param id  the strategy id to check
    @param token  The token to retrieve the balance for
    @return amount  the amount of token that is invested in the strategy
     */
    function getStrategyTokenBalance(uint256 id, address token) external view returns (uint256 amount);

    /**
    @notice Returns the total amount of a token invested across all strategies
    @param token  the token to fetch the balance for
    @return amount  the amount of the token currently invested
    */
    function getTokenTotalBalance(address token) external view returns (uint256 amount);

    /**
    @notice Returns the current amount awaiting deployment
    @param integration  the integration to deploy to
    @param poolID  the pool within the integration that should receive the tokens
    @param token  the token to be deployed
    @return the pending deploy amount
     */
    function getDeployAmount(
        address integration,
        uint32 poolID,
        address token
    ) external view returns (int256);

    /**
    @notice Returns balances per strategy, and total invested balances
    @param _strategies  The strategies to retrieve balances for
    @param _tokens  The tokens to retrieve
     */
    function getStrategyBalances(uint256[] calldata _strategies, address[] calldata _tokens)
        external
        view
        returns (StrategyBalance[] memory strategyBalances, GeneralBalance[] memory generalBalances);

    /**
  @notice Returns 1 or more strategies in a single call.
  @param ids  The ids of the strategies to return.
   */
    function getMultipleStrategies(uint256[] calldata ids) external view returns (StrategySummary[] memory);

    /// @notice autogenerated getter definition
    function idCounter() external view returns (uint256);

    /**
    @notice returns the length of the tokens array in a strategy
    @param strategy  the strategy to look up
    @return the length
    */
    function getStrategyTokenLength(uint256 strategy) external view returns (uint256);

    /**
    @notice Clears the list of positions that can be closed to supply a token
    @param tokens  The list of tokens to clear
     */
    function clearClosablePositions(address[] calldata tokens) external;

    /**
    @notice Closes enough positions to provide a requested amount of a token
    @param token  the token to source
    @param amount  the amount to source
     */
    function closePositionsForWithdrawal(address token, uint256 amount) external;

    /// @notice Sets the maximum investment cap for a strategy and token pair
    /// @param id The strategy id
    /// @param token  the token address
    /// @param maxCap  The maximum amount of funds that can be invested
    function setMaximumCap(
        uint256 id,
        address token,
        uint256 maxCap
    ) external;

    /// @notice Retrieves the maximum cap for a strategy/token pair
    /// @param id  the strategy id
    /// @param token  the token address
    /// @return cap  the maximum cap for the strategy/token pair
    function getMaximumCap(uint256 id, address token) external view returns (uint256 cap);
}
