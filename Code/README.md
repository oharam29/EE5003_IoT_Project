This the instrucution file for how to run the applicaion for the project of the module EE5003 IoT project. Once the project repository has been clone onto a machine the project can be run.

This can be done by:

  Start by chainging into the the filestore directory:

    cd filestore

  Then the fabric network must be started:

    ./startFabric.sh

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
    

