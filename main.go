package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"
)

type Change struct {
	originalAmount int
	originalPrice  int
	originalFee    int
	newAmount      int
	newPrice       int
	newFee         int
}

type ObjectChange struct {
	Amount []int `json:"amount"`
	Price  []int `json:"price_cents_usd"`
	Fee    []int `json:"patch_fee_cents_usd"`
}

func main() {

	// os.Open() opens specific file in
	// read-only mode and this return
	// a pointer of type os.File
	file, err := os.Open("data.csv")

	// Checks for the error
	if err != nil {
		log.Fatal("Error while reading the file", err)
	}

	// Closes the file
	defer file.Close()

	// The csv.NewReader() function is called in
	// which the object os.File passed as its parameter
	// and this creates a new csv.Reader that reads
	// from the file
	reader := csv.NewReader(file)

	// ReadAll reads all the records from the CSV file
	// and Returns them as slice of slices of string
	// and an error if any
	records, err := reader.ReadAll()

	// Checks for the error
	if err != nil {
		fmt.Println("Error reading records")
	}

	// Loop to iterate through
	// and print each of the string slice
	changeDict := make(map[string]Change)
	for i, eachrecord := range records {
		if i == 0 {
			continue
		}
		uid := eachrecord[2]
		changes := eachrecord[3]

		var objChange ObjectChange
		json.Unmarshal([]byte(changes), &objChange)
		if _, ok := changeDict[uid]; !ok {
			if objChange.Amount[0] == 0 {
				if objChange.Fee == nil {
					changeDict[uid] = Change{
						newAmount: objChange.Amount[1],
						newPrice:  objChange.Price[1],
					}
				} else {
					changeDict[uid] = Change{
						newAmount: objChange.Amount[1],
						newPrice:  objChange.Price[1],
						newFee:    objChange.Fee[1],
					}
				}
			} else {
				if objChange.Fee == nil {
					changeDict[uid] = Change{
						originalAmount: objChange.Amount[0],
						originalPrice:  objChange.Price[0],
					}
				} else {
					changeDict[uid] = Change{
						originalAmount: objChange.Amount[0],
						originalPrice:  objChange.Price[0],
						originalFee:    objChange.Fee[0],
					}
				}
			}
		} else {
			if objChange.Amount[0] == 0 {
				if objChange.Fee == nil {
					changeDict[uid] = Change{
						originalAmount: changeDict[uid].originalAmount,
						originalPrice:  changeDict[uid].originalPrice,
						originalFee:    changeDict[uid].originalFee,
						newAmount:      objChange.Amount[1],
						newPrice:       objChange.Price[1],
					}
				} else {
					changeDict[uid] = Change{
						originalAmount: changeDict[uid].originalAmount,
						originalPrice:  changeDict[uid].originalPrice,
						originalFee:    changeDict[uid].originalFee,
						newAmount:      objChange.Amount[1],
						newPrice:       objChange.Price[1],
						newFee:         objChange.Fee[1],
					}
				}
			} else {
				if objChange.Fee == nil {
					changeDict[uid] = Change{
						originalAmount: objChange.Amount[0],
						originalPrice:  objChange.Price[0],
						originalFee:    objChange.Fee[0],
						newAmount:      changeDict[uid].newAmount,
						newPrice:       changeDict[uid].newPrice,
					}
				} else {
					changeDict[uid] = Change{
						originalAmount: objChange.Amount[0],
						originalPrice:  objChange.Price[0],
						originalFee:    objChange.Fee[0],
						newAmount:      changeDict[uid].newAmount,
						newPrice:       changeDict[uid].newPrice,
						newFee:         changeDict[uid].newFee,
					}
				}
			}
		}
	}

	outputFile, _ := os.Create("parsed_data.csv")
	defer outputFile.Close()

	// 4. Write the header of the CSV file and the successive rows by iterating through the JSON struct array
	writer := csv.NewWriter(outputFile)
	defer writer.Flush()

	header := []string{"uid", "original_amount", "original_price", "original_fee", "new_amount", "new_price", "new_fee"}
	if err := writer.Write(header); err != nil {
		fmt.Println(err)
		return
	}

	for k, v := range changeDict {
		var csvRow []string

		csvRow = append(csvRow, k, strconv.Itoa(v.originalAmount), strconv.Itoa(v.originalPrice), strconv.Itoa(v.originalFee), strconv.Itoa(v.newAmount), strconv.Itoa(v.newPrice), strconv.Itoa(v.newFee))
		if err := writer.Write(csvRow); err != nil {
			fmt.Println(err)
			return
		}
	}
}
