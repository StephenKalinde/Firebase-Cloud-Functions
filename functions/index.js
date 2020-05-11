const functions = require('firebase-functions');
const  admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.sendNotificationToTopic = functions.database.ref('Inboxes/{inboxid}/{pushId}').onWrite(async (change, context) =>{

    const senderUID = change.after.child("UID").val();      //uid
    const receiverUID= change.after.child("DestinationUID").val();  // gets the topic{dest uid}
    const senderName = change.after.child("SenderName").val();      //gets sender name

    console.log("uidDest: " + receiverUID);

    //get token of receiving device
    return admin.database().ref('Tokens/'+receiverUID).once('value').then( async snapshot =>{

        const token = snapshot.val();
        console.log("token: ",token);

        const payLoad ={

            data: {

                data_type:"direct_message",
                title: "New Message",
                senderUID: senderUID,
                topic: receiverUID,
                senderName: senderName,
            }

        };

        let response= await admin.messaging().sendToDevice(token,payLoad);
        console.log(response);
        return response;


    });

    /** 
     * 
     * This method sends to specific topics not devices
     * 
    var message ={

        notification: {

            title: "The Rehab",
            body: "New Message",

        },

        topic: topic,

    };

    let response = await admin.messaging().send(message);
    **/

    

});

exports.sendNotificationToTopic = functions.database.ref('Requests/{myUid}/{peerPushId}').onWrite(async (change,context)=>{

    const peerEmailAddress = change.after.child("EmailAddress").val();  //request's email
    const peerUID = change.after.child("UID").val();        //user id
    const inboxId = change.after.child("InboxId").val();   //inbox id

    console.log("peer email: "+peerEmailAddress);
    console.log("peer uid: "+peerUID);
    console.log("inbox id: "+ inboxId);

    //get token of receiving device
    return admin.database().ref('Tokens/'+context.params.myUid).once('value').then( async snapshot =>{

        const token = snapshot.val();
        console.log("token: ",token);

        const payLoad ={

            data: {

                data_type:"request",
                title: "New Request",
                peerUID: peerUID,
                inboxId: inboxId,
                peerEmail: peerEmailAddress,

            }

        };

        let response= await admin.messaging().sendToDevice(token,payLoad);
        console.log(response);
        return response;

    }); 

    /**var message ={

        notification: {

            title: peerEmailAddress,
            body: "New Request",

        },

        topic: context.params.myUid,

    };

    let response = await admin.messaging().send(message); **/

});