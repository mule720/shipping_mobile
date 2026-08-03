import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';

class GraphQLClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  async query<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });

    const json = await response.json();
    if (json.errors) {
      throw new Error(json.errors[0]?.message || 'GraphQL error');
    }
    return json.data as T;
  }

  async mutate<T = any>(mutation: string, variables?: Record<string, any>): Promise<T> {
    return this.query<T>(mutation, variables);
  }
}

export const graphqlClient = new GraphQLClient();

export async function initClient() {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    graphqlClient.setToken(token);
  }
}
