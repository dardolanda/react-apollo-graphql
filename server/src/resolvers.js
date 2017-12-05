import { withFilter } from 'graphql-subscriptions';

import connector from './connectors'
import Channel from './models/Channel'
import User from './models/User'

import pubsub from '../pubsub'

import grpc from 'grpc'

var PROTO_PATH = './helloworld.proto';
var proto = grpc.load(PROTO_PATH);

import dotenv from 'dotenv'
dotenv.config({ path: '.env'})

var client = new proto.flyguide.FlyGuide('localhost:10000', grpc.credentials.createInsecure());

import grpcPromise from 'grpc-promise';
grpcPromise.promisifyAll(client);

export const resolvers = {
	Query: {
		channels: () => {
			// return new Promise((resolve, reject) => {
			// 	client.sayHello({ name: "user" }, function (err, response) {
			// 		resolve(JSON.parse(response && response.message) || [])
			// 	});
			// })

/*
			console.log("Channels not use")
			return client.GetFeature().sendMessage({
				latitude : 408122808 ,
				longitude: -743999179
			}).then( response => {

				response.message = response
				console.log("response --> Message --> " , response.message)

				return JSON.parse(response && response.message) || []
			})
			.catch( err => { return []})
*/

			return Channel.find({}).then((response) => { return response });
		},

		getFly: (root, inv ) => {

			console.log("inv -->" , inv)
			console.log("root  -->" , root)
/*			var fly = {}
			fly.name_origin = "buenos aires"
			fly.name_destiny = "mexico"
			var call = client.getFly(fly)
			console.log("call on --> " , call.on )
			return call.on('readable' , function (fly_each) {
				return fly_each
			})*/


			return client.GetFly().sendMessage({
				name_origin: inv.params != null ?  inv.params.from : '',
				name_destiny : inv.params != null ?  inv.params.to : ''
			}).then( response => {
				console.log("response --> Flies --> " , response.flies)

				return response.flies
			})
				.catch( err => { return []})

				//return []
		}
		,


		channel: (root, { name }) => {
			return Channel.findOne({ name }).then((response) => response);
		},
		getUser: (root, { id }) => {
			return User.findOne({ id }).then((response) => response);
		},
		getRole: (root, { id }) => {
			return User.findOne({ id }).then((response) => response);
		},
	},
	Mutation: {
		addChannel: (root, args) => {
			// const newChannel = { id: String(nextId++), messages: [], name: args.name };
			// channels.push(newChannel);
			const newChannel = new Channel(args);

			// pubsub.publish('channelAdded', { channelAdded: { id: newChannel._id, name: newChannel.name } } );

			// kafka
			pubsub.publish({ 'channel': 'channelAdded', channelAdded: { id: newChannel._id, name: newChannel.name } });

			return newChannel.save().then((response) => response);
			// channels.push(newChannel);
			// return newChannel;
		},
		addMessage: (root, { message }) => {
			const channel = channels.find(channel => channel.id === message.channelId);
			if (!channel)
				throw new Error("Channel does not exist");

			// const newMessage = { id: String(nextMessageId++), text: message.text };
			// channel.messages.push(newMessage);

			// pubsub.publish('messageAdded', { messageAdded: newMessage, channelId: message.channelId });

			// return newMessage;
		},
		logUser(root, args) {
			console.log("bien")
			const errors = [];

			return connector.Auth.signIn(args)
				.then(token => {
					let user = {}
					user.username = "usuario2"
					user.id = "1"
					user.username = "user"
					user.createdAt = Date()
					user.modifiedAt = Date()
					user.lastLogin = Date()

					return ({
						token,
						user,
						errors
					})
				})
				.catch((err) => {
					if (err.code && err.message) {
						errors.push({
							key: err.code,
							value: err.message
						});

						return { token: null, errors };
					}

					throw new Error(err);
				});
		}
	},
	Subscription: {
		channelAdded: {
			subscribe: () => pubsub.asyncIterator('channelAdded')
			// subscribe: withFilter(() => pubsub.asyncIterator('channelAdded'), (payload, variables) => {
			// return payload.name === variables.name;
			// return payload;
		},
		messageAdded: {
			subscribe: withFilter(() => pubsub.asyncIterator('messageAdded'), (payload, variables) => {
				// The `messageAdded` channel includes events for all channels, so we filter to only
				// pass through events for the channel specified in the query
				return payload.channelId === variables.channelId;
			}),
		}
	},
};
