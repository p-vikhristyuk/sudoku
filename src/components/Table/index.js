import "./index.css";
import {useEffect, useMemo, useState} from "react";

const Table = () => {

	const [matrix, setMatrix] = useState([]);
	const [showHint, setShowHint] = useState(false);
	const [progress, setProgress] = useState({common: null, passed: null, notPassed: null})
	const defaultList = Array.from(Array(9).keys());
	const getRandomValue = () => {
		return Math.floor(Math.random() * (8 - 1 + 1) + 1)
	}
	const getAreaNumber = (row, col) => {
		switch(true) {
			case row <= 2 && col <= 2:
				return 1;
			case row <= 2 && col <= 5:
				return 2;
			case row <= 2 && col <= 8:
				return 3;
			case row <= 5 && col <= 2:
				return 4;
			case row <= 5 && col <= 5:
				return 5;
			case row <= 5 && col <= 8:
				return 6;
			case row <= 8 && col <= 2:
				return 7;
			case row <= 8 && col <= 5:
				return 8;
			case row <= 8 && col <= 8:
				return 9;
			default:
				return null;
		}
	}

	const getNewList = (row) => {
		switch(row) {
			case 1:
				return [...defaultList.slice(-6), ...defaultList.slice(0,3)];
			case 2:
				return [...defaultList.slice(-3), ...defaultList.slice(0,6)];
			case 3:
				return [...defaultList.slice(1,9), ...defaultList.slice(0, 1)];
			case 4:
				return [...defaultList.slice(-5), ...defaultList.slice(0, 4)];
			case 5:
				return [...defaultList.slice(-2), ...defaultList.slice(0, 7)];
			case 6:
				return [...defaultList.slice(2, 9), ...defaultList.slice(0, 2)];
			case 7:
				return [...defaultList.slice(-4), ...defaultList.slice(0, 5)];
			case 8:
				return [...defaultList.slice(-1), ...defaultList.slice(0, 8)];
			default:
				return defaultList;
		}
	}

	const changeRowsByVertical = (index, oldRow, newRow, step) => {
		matrix[index] = newRow;
		matrix[index + step] = oldRow;
	}

	const changeRowsByHorizontal = (index, row, step) => {
		const oldCell = row[index];
		row[index] =  row[index + step];
		row[index + step] = oldCell;
	}

	const createMatrix = () => {
		const newMatrix = [];
		for(let row = 0; row < defaultList.length; row++) {
			let cols = [];

			for(let col = 0; col < defaultList.length; col++) {
				const randomValue = getRandomValue();
				const shouldShowAsDefault = randomValue > 3 && randomValue <= 6;
				const cell = {
					value: getNewList(row)[col] + 1,
					newValue: null,
					row: row,
					col: col,
					area: getAreaNumber(row, col),
					state: shouldShowAsDefault ? "default" : null
				}
				cols.push(cell);
			}

			newMatrix.push(cols)
		}
		defaultList.forEach(current => {
			const direction = getRandomValue() < 5 ? "vertical" : "horizontal";
			if(direction === "vertical") {
				const currentRow = newMatrix[current];
				const nextRow = newMatrix[current + 1];
				const prevRow = newMatrix[current - 1];
				const currentArea = newMatrix[current][0].area;

				if(nextRow && nextRow[0].area === currentArea) {
					changeRowsByVertical(current, currentRow, nextRow, 1)
					return;
				}

				changeRowsByVertical(current, currentRow, prevRow, -1)

			} else if(direction === "horizontal") {
				const currentArea = newMatrix[0][current].area;
				if(newMatrix[0][current + 1] && newMatrix[0][current + 1].area === currentArea) {
					newMatrix.forEach(row => {
						changeRowsByHorizontal(current, row, 1);
					})
				} else {
					newMatrix.forEach(row => {
						changeRowsByHorizontal(current, row, -1);
					})
				}
			}
		});
		return newMatrix;
	}

	useEffect(() => {
		const matrix = createMatrix();
		if(matrix) {
			setMatrix(matrix)
		}
	}, [])

	const setValueToTheMatrix = (row, col, value) => {
		const copyMatrix = [...matrix];
		copyMatrix[row][col].newValue = Number(value);
		if(copyMatrix[row][col].value === Number(value)) {
			copyMatrix[row][col].state = "passed";
		}
		setMatrix(copyMatrix);
	}

	const getInputClassName = (cell) => {
		if(cell.newValue && cell.newValue !== cell.value) {
			return "error"
		}
		if(cell.state === "passed") {
			return "passed";
		}
	}

	const getProgress = () => {
		const commonCount = matrix.reduce((acc, row) => {
			const items = row.filter(col => col.state !== "default")
			return [...acc, ...items];
		}, []);
		const notPassedItems = matrix.reduce((acc, row) => {
			const items = row.filter(col => col.state === null)
			return [...acc, ...items];
		}, []);
		const passedItems = matrix.reduce((acc, row) => {
			const items = row.filter(col => col.state === "passed")
			return [...acc, ...items];
		}, []);
		setProgress({
			notPassed: notPassedItems.length,
			passed: passedItems.length,
			common: commonCount.length
		})
	}

	useEffect(() => {
		getProgress()
	}, [matrix])

	return(
		<div className="table">
			<div className="progress">Progress: {progress && `${progress.passed}/${progress.common}`}</div>
			<div className="container">
				{matrix && matrix.length > 0 && matrix.map((row, rowIndex) => {
					return(
						<div className="row" key={rowIndex}>
							{row.map((col, colIndex) => {
								return(
									<div className="cell" key={colIndex}>
										<input
											className={getInputClassName(col)}
											disabled={col.state === "default"}
											type="text"
											value={col.state === "default" ? col.value : col.newValue ? col.newValue : ""}
											onChange={(e) => setValueToTheMatrix(rowIndex, colIndex, e.target.value)}
											placeholder={showHint ? col.value : ""}
										/>
									</div>
								)
							})}
						</div>
					)
				})}
				<div className="overlay">
					{defaultList.map((_, index) => {
						return <div className="sq" key={index}/>
					})}
				</div>
				{progress.notPassed === 0 &&  <div className="message">Done!</div>}
			</div>
			<div className="btn-holder">
				<button className="btn" onClick={() => setShowHint(!showHint)}>{showHint ? "Hide" : "Show"} hint</button>
			</div>
		</div>
	)
}

export default Table