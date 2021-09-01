/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const prompt = require('prompt');
const readline = require('readline');
const sha256 = require('sha256');

function userinput() {
        var args = process.argv;

        var user = args[1].toString();
        var file = args[2].toString();


        var transaction_content = [];
        var x = inputFile(file);
        
        transaction_content[0] = x[0];
        transaction_content[1] = x[1];
        console.log(transaction_content);

        var username = UserCred(user);
        transaction_content[2] = username;

        var content = fs.readFileSync(file, 'utf8');
        //console.log(content);

            
        var hashed = hashFile(content);
        console.log(hashed);
        transaction_content[3] = hashed;


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
            console.time('Reading in the file, time elapsed');
            var transact = userinput();
            var time = new Date();
            var json = JSON.stringify(time);
            await contract.submitTransaction('createFile', 'File10', transact[1], transact[0], transact[2], transact[3], json);
            console.timeEnd('Reading in the file, time elapsed');
        }



        // Disconnect from the gateway.
    	await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
