# EE5003_IoT_Project
Repo for the EE5003 IoT Project module as part of the MCTY course in DCU

This project is built using the Hyperledger fabric network that hs been modified to carry out the reuqired features to accomdate files.

The docs directory contains all documentation relating to the project such as the Research Log, porject Final report and the video presentation.

///----- Below is the instructions on how to run the project -----///

This is the Code works repo for the project of the module EE5003 IoT project. Once the project repository has been clone onto a machine the project can be run.

This can be done by changing directory to the Code Directory and follwing the below steps:

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
    node invoke

  You can run the query application as follows. By default, the query application will
  return all files. It will show the name, extension, owner, content and timestamp of when the transaction 
  took place.
    node query

