import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

export const publish = (lobbyId: string, payload: any) => pubsub.publish(`GAME_EVENT_${lobbyId}`, { onGameEvent: payload });
export default pubsub;