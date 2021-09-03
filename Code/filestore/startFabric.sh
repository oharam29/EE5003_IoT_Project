#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)
CC_SRC_LANGUAGE=${1:-"go"}
CC_SRC_LANGUAGE=`echo "$CC_SRC_LANGUAGE" | tr [:upper:] [:lower:]`

if [ "$CC_SRC_LANGUAGE" = "go" -o "$CC_SRC_LANGUAGE" = "golang" ] ; then
	CC_SRC_PATH="../chaincode/filestore/go/"
elif [ "$CC_SRC_LANGUAGE" = "javascript" ]; then
	CC_SRC_PATH="../chaincode/filestore/javascript/"
elif [ "$CC_SRC_LANGUAGE" = "java" ]; then
	CC_SRC_PATH="../chaincode/filestore/java"
elif [ "$CC_SRC_LANGUAGE" = "typescript" ]; then
	CC_SRC_PATH="../chaincode/filestore/typescript/"
else
	echo The chaincode language ${CC_SRC_LANGUAGE} is not supported by this script
	echo Supported chaincode languages are: go, java, javascript, and typescript
	exit 1
fi

# clean out any old identites in the wallets
rm -rf javascript/wallet/*
rm -rf java/wallet/*
rm -rf typescript/wallet/*
rm -rf go/wallet/*

# launch network; create channel and join peer to channel
pushd ../test-network
./network.sh down
./network.sh up createChannel -ca -s couchdb
./network.sh deployCC -ccn fabcar -ccv 1 -cci initLedger -ccl ${CC_SRC_LANGUAGE} -ccp ${CC_SRC_PATH}
popd

cat <<EOF

Total setup execution time : $(($(date +%s) - starttime)) secs ...

The filestore application interacts with the deployed filestore contract in order to preovide the ability to store the users files securely on the chain.
The filestore applications is available in the node.js programming language.


JavaScript:

  Start by changing into the "javascript" directory:

    cd javascript

  Next, install all required packages:

    npm install

  Then run the following applications to enroll the admin user, and register a new user
  called appUser which will be used by the other applications to interact with the deployed
  filestore contract:

    node enrollAdmin
    node registerUser

  You can run the invoke application as follows. By default, the invoke application will
  take in a file as a command line argument and read the name, extension, the current user and the file 
  content. It will hash the content and then addit to the chain. Then it will edit the name, owner and
  extension of a file.

    node invoke -filename

  You can run the invoke time test application as follows. By default, the invoke time test application will
  take in a file as a command line argument and read the name, extension, the current user and the file 
  content. It will hash the content and then addit to the chain. It will then display the added file name
  and extension and the time elapsed to complete the run.

    node invoke_test.js --filename

  You can run the invoke secure application as follows. By default, the invoke secure application will
  take in a file as a command line argument and read the name, extension, the current user and the file 
  content.The hash for this applicaion will be the result of combing the file name, extesion, owner and
  content. It will then spilt the hash into equal segments and store them in the payload. This allows 
  for even more secure storage of files as it would be harder to detemine the full hash as the 4 parts
  could be arranged in any order.

    node invoke_secure.js -filename

  You can run the query application as follows. By default, the query application will
  return all files. It will show the name, extension, owner, content and timestamp of when the transaction 
  took place.

    node query
    
  In order to search for a specific file on the chain. Run the query command and pass the file key as a command line argument. This will return only data about the file in the query.
  The command to run is:
  
    node query.js --filekey
    
  In order to verify the hash has not been edit and verify the integrity of the file the query_test.js should be ran. It needs command line argument to be passed to it and it will test
  the hash and return the result
  
    node query_test.js --filekey
    
  Finally, to shut the network down again first you need to run the following command to go back a directory level:
  
    cd ..
    
  Then the command to stop the network is:
  
    ./networkDown.sh
    


EOF
