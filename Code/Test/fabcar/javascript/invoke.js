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
const readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});

async function userinput() {
		var details = new Array();
		var filetype = "";
		var fileowner = "";
		var filename = "";
		var filedesc = "";

		console.log(details.length);

		readline.question('What type of file is it?', (ftype) => {
			filetype = ftype;
			console.log(filetype);
			readline.question('What is the file name?', fname => {
				filename=fname;
				readline.question('Who owns the file?', fowner => {
					fileowner = fowner;
					readline.question('What type  of file is it?', fdescription => {
						filedesc = fdescription;
						contract.submitTransaction('createFile', 'File02', filetype, 						filename, fileowner, filedesc);
						console.log(details.length);
						readline.close();
						readline.removeAllListeners();

					});
				});
			});
		});
		details[0] = filetype;
		details[1] = filename;
		details[2] = fileowner;
		details[3] = filedesc;



		console.log(details[0]);
	return details;
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

        var time = new Date();
        console.log(time);

        var json = JSON.stringify(time);

		await contract.submitTransaction('createFile', 'File02', 'PDF', 'Sales Figures', 'Manager', 'Sales figures for the week', json);
		console.log('Transaction submitted');

		await contract.submitTransaction('EditFileOwner', 'File02', 'New Manager');
		console.log('File Owner has been edited');

		await contract.submitTransaction('EditFileType', 'File02', 'Word Doc');
		console.log('File Type has been edited');

        // Disconnect from the gateway.
    	await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
