/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const readline = require('readline');
const sha256 = require('sha256');

function userinput() {
        var args = process.argv;

        var user = args[1].toString();
        var file = args[2].toString();


        var transaction_content = [];
        var x = inputFile(file);
        
        console.log("Filename: " + x[0]);
        transaction_content[0] = x[0];

        console.log('File extension: ' + x[1]);
        transaction_content[1] = x[1];
        //console.log(transaction_content);

        var content = fs.readFileSync(file, 'utf8');

        var username = UserCred(user);
        console.log('Current User: ' + username)

        transaction_content[2] = username;


        var hashed = hashFile(content);
        console.log('Resulting hash: ' + hashed);
        transaction_content[3] = hashed;

        console.log('Payload content:')
        console.log(transaction_content);
        return transaction_content;

}

function hashFile(stringtohash) {
    var x = stringtohash;

    var hash = sha256(x);
    //console.log(hash);

    return hash;

}

function inputFile(filetohash){
        var file = filetohash;
        var fileparts = file.split('.',2);
        var name = fileparts[0];
        fileparts[1] = "." + fileparts[1];
        var extension = fileparts[1];
        return fileparts;
}

function UserCred(usercreds){
        var user = usercreds;
        var username = user.split('/');
        var name = username[2];
        return name;
}

function getRandInt(max){
    return Math.floor(Math.random()*max);
}

async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('filestore');

        // Get the contract from the network.
        const contract = network.getContract('files');

        var args = process.argv;
        if(args.length == 3){
            // Submit the specified transaction.
            var transact = userinput();
            var time = new Date();
            var json = JSON.stringify(time);
            var fileKey = 'File' + getRandInt(10000).toString();
            console.log('Adding file to chain. Key : ' + fileKey);
            await contract.submitTransaction('createFile', fileKey, transact[1], transact[0], transact[2], transact[3], json);
        }

        
        console.log("//-------------------------------------------");
        var time = new Date();
        var json = JSON.stringify(time);
		await contract.submitTransaction('createFile', 'File02', 'PDF', 'Sales Figures', 'Manager', 'Sales figures for the week', json);
		console.log('Transaction submitted');

        console.log("//-------------------------------------------");
        var time = new Date();
        var json = JSON.stringify(time);
		await contract.submitTransaction('createFile', 'File03', 'PDF', 'Purchase Figures', 'Manager', 'Purchase figures for the week', json);
		console.log('Transaction submitted');

        console.log("//-------------------------------------------");
		await contract.submitTransaction('EditFileOwner', 'File02', 'New Manager');
		console.log('File Owner has been edited');

        console.log("//-------------------------------------------");
		await contract.submitTransaction('EditFileType', 'File02', 'Word Doc');
		console.log('File Type has been edited');

        console.log("//-------------------------------------------");
		await contract.submitTransaction('EditFileName', 'File03', 'Puchase Invoice');
		console.log('File Type has been edited');


        // Disconnect from the gateway.
    	await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
