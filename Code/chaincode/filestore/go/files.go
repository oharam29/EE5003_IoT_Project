/*
SPDX-License-Identifier: Apache-2.0
*/

package main

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"time"
)

// SmartContract provides functions for managing a file
type SmartContract struct {
	contractapi.Contract
}

// File describes basic details of what makes up a file
type File struct { 
	Type string `json:"filetype"`
	Name string `json:"name"` 
	Owner string `json:"owner"`
	Content string `json:"content"`
	TimeStamp string `json:timestamp`
}

// QueryResult structure used for handling result of query
type QueryResult struct {

	Key	string `json:"Key"`
	Record	*File
}

// InitLedger adds a base set of files to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	//console.log(date);
	//var json = JSON.stringify(date);	
	timestamp,e := ctx.GetStub().GetTxTimestamp()
	t := time.Unix(timestamp.Seconds, int64(timestamp.Nanos)).String()
	if e != nil {
		return fmt.Errorf("Failed to fetch time. %s", e.Error())
	}

	files := []File{


		
		File{Type: "Word", Name: "Grades", Owner: "Mike", Content: "Grades of Maths test", TimeStamp: t},
	}

	for i, file := range files {
		fileAsBytes, _ := json.Marshal(file)
		err := ctx.GetStub().PutState("File"+strconv.Itoa(i), fileAsBytes)

		if err != nil {
			return fmt.Errorf("Failed to put to world state. %s", err.Error())
		}
	}

	return nil
}

// CreateFile adds a new file to the world state with given details
func (s *SmartContract) CreateFile(ctx contractapi.TransactionContextInterface, fileNumber string, filetype string, name string, owner string, content string, timestamp string) error {
	file := File{
		Type:   filetype,
		Name:  name,
		Owner: owner,
		Content:  content,
		TimeStamp: timestamp,
	}

	fileAsBytes, _ := json.Marshal(file)

	return ctx.GetStub().PutState(fileNumber, fileAsBytes)
}

// QueryFile returns the file stored in the world state with given id
func (s *SmartContract) QueryFile(ctx contractapi.TransactionContextInterface, fileNumber string) (*File, error) {
	fileAsBytes, err := ctx.GetStub().GetState(fileNumber)

	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state. %s", err.Error())
	}

	if fileAsBytes == nil {
		return nil, fmt.Errorf("%s does not exist", fileNumber)
	}

	file := new(File)
	_ = json.Unmarshal(fileAsBytes, file)

	return file, nil
}

// QueryAllFiles returns all files found in world state
func (s *SmartContract) QueryAllFiles(ctx contractapi.TransactionContextInterface) ([]QueryResult, error) {
	startKey := ""
	endKey := ""

	resultsIterator, err := ctx.GetStub().GetStateByRange(startKey, endKey)

	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	results := []QueryResult{}

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()

		if err != nil {
			return nil, err
		}

		file := new(File)
		_ = json.Unmarshal(queryResponse.Value, file)

		queryResult := QueryResult{Key: queryResponse.Key, Record: file}
		results = append(results, queryResult)

	}

	return results, nil
}

// EditFile updates the owner field of file with given id in world state
func (s *SmartContract) EditFileOwner(ctx contractapi.TransactionContextInterface, fileNumber string, newOwner string) error {
	file, err := s.QueryFile(ctx, fileNumber)

	if err != nil {
		return err
	}

	file.Owner = newOwner

	timestamp,e := ctx.GetStub().GetTxTimestamp()
	t := time.Unix(timestamp.Seconds, int64(timestamp.Nanos)).String()
	if e != nil {
		return fmt.Errorf("Failed to fetch time. %s", e.Error())
	}
	file.TimeStamp = t

	fileAsBytes, _ := json.Marshal(file)

	return ctx.GetStub().PutState(fileNumber, fileAsBytes)
}

// EditFile updates the owner field of file with given id in world state
func (s *SmartContract) EditFileType(ctx contractapi.TransactionContextInterface, fileNumber string, newType string) error {
	file, err := s.QueryFile(ctx, fileNumber)

	if err != nil {
		return err
	}

	file.Type = newType

	timestamp,e := ctx.GetStub().GetTxTimestamp()
	t := time.Unix(timestamp.Seconds, int64(timestamp.Nanos)).String()
	if e != nil {
		return fmt.Errorf("Failed to fetch time. %s", e.Error())
	}
	file.TimeStamp = t

	fileAsBytes, _ := json.Marshal(file)

	return ctx.GetStub().PutState(fileNumber, fileAsBytes)
}

// EditFile updates the owner field of file with given id in world state
func (s *SmartContract) EditFileName(ctx contractapi.TransactionContextInterface, fileNumber string, newName string) error {
	file, err := s.QueryFile(ctx, fileNumber)

	if err != nil {
		return err
	}

	file.Type = newName

	timestamp,e := ctx.GetStub().GetTxTimestamp()
	t := time.Unix(timestamp.Seconds, int64(timestamp.Nanos)).String()
	if e != nil {
		return fmt.Errorf("Failed to fetch time. %s", e.Error())
	}
	file.TimeStamp = t

	fileAsBytes, _ := json.Marshal(file)

	return ctx.GetStub().PutState(fileNumber, fileAsBytes)
}

func main() {

	chaincode, err := contractapi.NewChaincode(new(SmartContract))

	if err != nil {
		fmt.Printf("Error create fabcar chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting fabcar chaincode: %s", err.Error())
	}
}
