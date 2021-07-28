/*
SPDX-License-Identifier: Apache-2.0
*/

package main

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing a file
type SmartContract struct {
	contractapi.Contract
}

// File describes basic details of what makes up a file
type Car struct {
	Make   string `json:"make"`
	Model  string `json:"model"`
	Colour string `json:"colour"`
	Owner  string `json:"owner"`
}

type File struct { 
	Type string `json:"filetype"`
	Name string `json:"name"` 
	Owner string `json:"owner"`
	Description string `json:"description"`
}

// QueryResult structure used for handling result of query
type QueryResult struct {
	//Key    string `json:"Key"`
	//Record *File

	Key	string `json:"Key"`
	Record	*File
}

// InitLedger adds a base set of files to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	files := []File{

		File{Type: "Word", Name: "Grades", Owner: "Mike", Description: "Grades of Maths test"},
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
func (s *SmartContract) CreateFile(ctx contractapi.TransactionContextInterface, fileNumber string, filetype string, name string, owner string, description string) error {
	file := File{
		Type:   filetype,
		Name:  name,
		Owner: owner,
		Description:  description,
	}

	fileAsBytes, _ := json.Marshal(file)

	return ctx.GetStub().PutState(fileNumber, fileAsBytes)
}

// QueryCar returns the file stored in the world state with given id
func (s *SmartContract) QueryCar(ctx contractapi.TransactionContextInterface, fileNumber string) (*File, error) {
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

// QueryAllCars returns all files found in world state
func (s *SmartContract) QueryAllCars(ctx contractapi.TransactionContextInterface) ([]QueryResult, error) {
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

// ChangeCarOwner updates the owner field of file with given id in world state
func (s *SmartContract) ChangeCarOwner(ctx contractapi.TransactionContextInterface, fileNumber string, newOwner string) error {
	file, err := s.QueryCar(ctx, fileNumber)

	if err != nil {
		return err
	}

	file.Owner = newOwner

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
