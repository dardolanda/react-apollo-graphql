import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
} from 'graphql-tools';

import { resolvers } from './resolvers';

const typeDefs = `
type Channel {
  id: ID!                # "!" denotes a required field
  name: String
  # messages: [Message]!
}

input MessageInput{
  channelId: ID!
  text: String
}

type Message {
  id: ID!
  text: String
}

# Error type.
type Error {
  key: String
  value: String
}
# user
type User {
  id: String
  username: String
  createdAt: String
  modifiedAt: String
  lastLogin: String
}
# Role
type Role {
  id: String
  name: String
  createdAt: String
}

# Auth type.
type Auth {
  token: String
  user: User
  errors: [Error]
}

type FlyId {
	name_origin :String
	name_destiny:String
}

type Flies {
	FlyInit : [Fly]
}

type Fly {
   fly_number:Int
   fly_id: FlyId
   name : String
   description:String
}

input FlyListQueryInput {
	from : String
	to : String
}



# This type specifies the entry points into our API
type Query {
  channels: [Channel]    # "[]" means this is a list of channels
  channel(name: String!): Channel
  getUser(id: ID!): User 
  getRole(id: ID!): Role
  getFly(params : FlyListQueryInput): [Fly]
}



# The mutation root type, used to define all mutations
type Mutation {
  addChannel(name: String!): Channel
  addMessage(message: MessageInput!): Message
  logUser(email: String!, password: String!): Auth
}

# The subscription root type, specifying what we can subscribe to
type Subscription {
  channelAdded: Channel
  messageAdded(channelId: ID!): Message
}
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });
export { schema };
