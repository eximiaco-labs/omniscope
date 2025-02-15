import { useApolloClient, ApolloClient } from '@apollo/client';
import { useEdgeClientContext } from '../components/ApolloWrapper';

type OmniApolloClient = ApolloClient<any> & {
  name?: 'default' | 'edge';
};

export function useEdgeClient() {
  return useEdgeClientContext();
}

export function useDefaultClient() {
  return useApolloClient() as OmniApolloClient;
} 