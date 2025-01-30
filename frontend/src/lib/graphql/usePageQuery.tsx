import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useQueryBuilder } from './QueryBuilderContext';
import { useEdgeClient } from '@/app/hooks/useApolloClient';

export function usePageQuery<T = any>() {
  const { state, buildQuery, reset } = useQueryBuilder();
  const client = useEdgeClient();
  const { query, variables } = buildQuery();

  const queryResult = useQuery<T>(query, {
    variables,
    skip: state.fragments.length === 0,
    client: client ?? undefined,
    ssr: true
  });

  // Reset query builder when component unmounts
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return queryResult;
} 