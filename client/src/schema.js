export const typeDefs = `

type Channel {
  id: ID!
  name: String
}

type FlyId {
	name :String
	fly_number:Int
}

type Fly {
   fly_id: FlyId
   name : String
   description:String
}

type Query {
  channels: [Channel]
  getFly(flyId : FlyId): Fly
}
`;
