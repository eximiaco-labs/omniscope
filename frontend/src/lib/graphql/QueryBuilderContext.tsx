import { createContext, useContext, useReducer, ReactNode } from 'react';
import { DocumentNode, gql } from '@apollo/client';

// Types
export type QueryFragment = {
  id: string;
  fragment: string;
  variables?: Record<string, any>;
};

type QueryBuilderState = {
  fragments: QueryFragment[];
  variables: Record<string, any>;
};

type QueryBuilderAction =
  | { type: 'ADD_FRAGMENT'; payload: QueryFragment }
  | { type: 'REMOVE_FRAGMENT'; payload: { id: string } }
  | { type: 'ADD_VARIABLES'; payload: Record<string, any> }
  | { type: 'RESET' };

// Context
type QueryBuilderContextType = {
  state: QueryBuilderState;
  addFragment: (fragment: QueryFragment) => void;
  removeFragment: (id: string) => void;
  addVariables: (variables: Record<string, any>) => void;
  reset: () => void;
  buildQuery: () => { query: DocumentNode; variables: Record<string, any> };
  previewQuery: () => string;
};

const QueryBuilderContext = createContext<QueryBuilderContextType | undefined>(undefined);

// Reducer
function queryBuilderReducer(state: QueryBuilderState, action: QueryBuilderAction): QueryBuilderState {
  switch (action.type) {
    case 'ADD_FRAGMENT':
      return {
        ...state,
        fragments: [...state.fragments, action.payload],
        variables: {
          ...state.variables,
          ...(action.payload.variables || {}),
        },
      };
    case 'REMOVE_FRAGMENT':
      return {
        ...state,
        fragments: state.fragments.filter((f) => f.id !== action.payload.id),
      };
    case 'ADD_VARIABLES':
      return {
        ...state,
        variables: {
          ...state.variables,
          ...action.payload,
        },
      };
    case 'RESET':
      return {
        fragments: [],
        variables: {},
      };
    default:
      return state;
  }
}

// Helper function to build query string
function buildQueryString(fragments: QueryFragment[], variables: Record<string, any>): string {
  if (fragments.length === 0) {
    return 'query EmptyQuery { __typename }';
  }

  const variableDefinitions = Object.keys(variables)
    .map(key => `$${key}: String!`)
    .join(', ');

  return `
query PageQuery${variableDefinitions ? `(${variableDefinitions})` : ''} {
  ${fragments.map((f) => f.fragment).join('\n  ')}
}`.trim();
}

// Provider
export function QueryBuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(queryBuilderReducer, {
    fragments: [],
    variables: {},
  });

  const addFragment = (fragment: QueryFragment) => {
    dispatch({ type: 'ADD_FRAGMENT', payload: fragment });
  };

  const removeFragment = (id: string) => {
    dispatch({ type: 'REMOVE_FRAGMENT', payload: { id } });
  };

  const addVariables = (variables: Record<string, any>) => {
    dispatch({ type: 'ADD_VARIABLES', payload: variables });
  };

  const reset = () => {
    dispatch({ type: 'RESET' });
  };

  const buildQuery = () => {
    const queryString = buildQueryString(state.fragments, state.variables);
    return {
      query: gql(queryString),
      variables: state.variables,
    };
  };

  const previewQuery = () => {
    return buildQueryString(state.fragments, state.variables);
  };

  return (
    <QueryBuilderContext.Provider
      value={{
        state,
        addFragment,
        removeFragment,
        addVariables,
        reset,
        buildQuery,
        previewQuery,
      }}
    >
      {children}
    </QueryBuilderContext.Provider>
  );
}

// Hook
export function useQueryBuilder() {
  const context = useContext(QueryBuilderContext);
  if (!context) {
    throw new Error('useQueryBuilder must be used within a QueryBuilderProvider');
  }
  return context;
} 