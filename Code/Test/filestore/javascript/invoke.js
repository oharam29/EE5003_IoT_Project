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

function userinput() {
        var args = process.argv;
        if(args.length < 3){
            console.log("Usage: node " + args[1] + "FILENAME");
            process.exit(1);
        }
        var transaction_content = [];
        var x = inputFile();
        
        transaction_content[0] = x[0];
        transaction_content[1] = x[1];
        console.log(transaction_content);

        var file = args[2].toString();

        fs.readFile(file, 'utf8', function(err, data){
            if (err) throw err;
            console.log("Reading: " + file);
            var content = data;
            console.log(data);
        });


}

function inputFile(){
        var args = process.argv;
        var file = args[2].toString();
        var fileparts = file.split('.',2);
        var name = fileparts[0];
        fileparts[1] = "." + fileparts[1];
        var extension = fileparts[1];
        return fileparts
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
        const contract = network.getContract('fabcar');

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
        //await contract.submitTransaction('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom');
        console.log('Transaction has been submitted');

        //newFile();
        userinput();
/*
        var time = new Date();
        console.log(time);

        var json = JSON.stringify(time);

		await contract.submitTransaction('createFile', 'File02', 'PDF', 'Sales Figures', 'Manager', 'Sales figures for the week', json);
		console.log('Transaction submitted');

		await contract.submitTransaction('createFile', 'File03', 'PDF', 'Purchase Figures', 'Manager', 'Purchase figures for the week', json);
		console.log('Transaction submitted');

		await contract.submitTransaction('EditFileOwner', 'File02', 'New Manager');
		console.log('File Owner has been edited');

		await contract.submitTransaction('EditFileType', 'File02', 'Word Doc');
		console.log('File Type has been edited');

		await contract.submitTransaction('EditFileName', 'File03', 'Puchase Invoice');
		console.log('File Type has been edited');
*/

        // Disconnect from the gateway.
    	await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
