/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');




async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

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

        // Evaluate the specified transaction.

        // queryFile transaction - requires 1 argument, ex: ('queryFile', 'File01')
        var args = process.argv;
        if(args.length == 3){
            var filetofind = args[2].toString();
            const result = await contract.evaluateTransaction('queryFile', filetofind);

            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

            const passedfile = result.toString().split(",");
            const filename = passedfile[1].split(":");
            const passedhash = passedfile[3].split(":");


            if(filename[1] == '"linuxcode"'){
                var hash = '"c0ff217a744a16907e14f69437d076d771a7f6899ed511a114bba4a8a90aa990"';
                if(passedhash[1] == hash){
                    console.log("Hash matches: File is not compromised");
                }
                else{
                    console.log("Hash doen't match: File may be compromised");
                }
            }
            if(filename[1] == '"HyperLedger"'){
                var hash = '"9dbf35c7ab9bd5319f56dd602766ad2a28bcf8d0a4117d24eecb5fe301448793"';
                if(passedhash[1] == hash){
                    console.log("Hash matches: File is not compromised");
                }
                else{
                    console.log("Hash doen't match: File may be compromised");
                }
            }
           if(filename[1] == '"LongestText"'){
                var hash = '"2d3824f03c7a18cbc02bf8b323b2252207da06f70ec4725b27afa50a7907770b"';
                if(passedhash[1] == hash){
                    console.log("Hash matches: File is not compromised");
                }
                else{
                    console.log("Hash doen't match: File may be compromised");
                }
            }
            



        }
        else{
            // queryAllFiles transaction - requires no arguments, ex: ('queryAllFiles')
            const result = await contract.evaluateTransaction('queryAllFiles');
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        }


        // Disconnect from the gateway.
        await gateway.disconnect();
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main();
