import { gql } from 'graphql-tag';

export const queries = {
  CREATE_ITEM: gql`
    mutation CreateItem(
      $boardId: ID!
      $itemName: String!
      $columnValues: JSON!
      $groupId: String!
    ) {
      create_item(
        board_id: $boardId
        group_id: $groupId
        item_name: $itemName
        column_values: $columnValues
      ) {
        id
      }
    }
  `,

  UPDATE_ITEM: gql`
    mutation ChangeItemName(
      $boardId: ID!
      $itemId: ID!
      $columnId: String!
      $value: JSON!
    ) {
      change_column_value(
        board_id: $boardId
        item_id: $itemId
        column_id: $columnId
        value: $value
      ) {
        id
      }
    }
  `,

  DELETE_ITEM: gql`
    mutation DeleteItem($itemId: ID!) {
      delete_item(item_id: $itemId) {
        id
      }
    }
  `,

  //   GET_ITEMS: gql`
  //   query GetBoardItems ($boardId: ID!)  {
  //   items(limit: 100, page: 1) {
  //     id
  //     name
  //     column_values {
  //       id
  //       title
  //       text
  //     }
  //   }
  // }
  // }

  //   `

  GET_BOARD_ITEMS: gql`
    query GetBoardItems($boardId: ID!) {
      boards(ids: [$boardId]) {
        id
        name
        groups {
          id
          title
          items {
            id
            name
          }
        }
      }
    }
  `,

  CREATE_WEBHOOK: gql`
    mutation CreateWebhook(
      $boardId: ID!
      $url: String!
      $event: WebhookEventType!
      $config: String!
    ) {
      create_webhook(
        board_id: $boardId
        url: $url
        event: $event
        config: $config
      ) {
        id
        board_id
      }
    }
  `,
} as const;
