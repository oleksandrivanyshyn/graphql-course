import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink, Observable } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import ws from 'ws';

const getClient = (
  jwt,
  httpURL = 'http://localhost:4000',
  websocketURL = 'ws://localhost:4000',
) => {
  const request = async (operation) => {
    if (jwt) {
      operation.setContext({
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
    }
  };

  const requestLink = new ApolloLink((operation, forward) => {
    return new Observable((observer) => {
      let handle;
      Promise.resolve(operation)
        .then((oper) => {
          request(oper);
        })
        .then(() => {
          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          });
        })
        .catch(observer.error.bind(observer));

      return () => {
        if (handle) {
          handle.unsubscribe();
        }
      };
    });
  });

  const wsLink = ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        );
      }

      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
      }
    }),
    requestLink,
    new WebSocketLink({
      uri: websocketURL,
      options: {
        reconnect: true,
        connectionParams: () => {
          if (jwt) {
            return {
              Authorization: `Bearer ${jwt}`,
            };
          }
        },
      },
      webSocketImpl: ws,
    }),
  ]);

  const httpLink = ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        );
      }
      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
      }
    }),
    requestLink,
    new HttpLink({
      uri: httpURL,
      credentials: 'same-origin',
    }),
  ]);

  const link = ApolloLink.split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLink,
  );

  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
};

export { getClient as default };
