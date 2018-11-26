//BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcperecentage = function (totalIncome) {
        if (totalIncome > 0)
            this.percentage = Math.round((this.value / totalIncome) * 100);
        else
            this.percentage = -1;
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (curr) {
            sum += curr.value;
        });
        data.totals[type] = sum;
    };
    var data = {

        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,

        percentage: -1

    };

    return {
        addItem: function (type, desc, val) {
            var newItem, ID


            // Create new ID
            if (data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            else
                ID = 0;

            // create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            }

            else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }

            // push it to data structure 
            data.allItems[type].push(newItem);

            // return new element
            return newItem;
        },


        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            // calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');
            // calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            // calculate the percentage of income 
            if (data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            else
                data.percentage = -1;
        },
        calcualtePecentages: function () {
            data.allItems.exp.forEach(function (curr) {
                curr.calcperecentage(data.totals.inc);
            });
        },

        getPecentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp,
                percentage: data.percentage
            };
        },
        testing: function () {
            console.log(data);
        }
    };


})();


// UI CONTROLELR
var UIController = (function () {

    var DOMStrings = {
        inputType: '.add__type',
        inputaddDescription: '.add__description',
        inputaddValue: '.add__value',
        inputaddButon: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        monthLabel: '.budget__title--month'
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    var formatNumber = function (num, type) {
        /*
        + or - before the number
        exaclty 2 decimal places
        comma seperated for thousands
        */

        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];
        return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec;

    };

// get input from the browser

    return {
        getInput: function () {

            return {
                type: document.querySelector(DOMStrings.inputType).value, // will be either inc or exp 
                description: document.querySelector(DOMStrings.inputaddDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputaddValue).value)
                //value : document.querySelector(DOMStrings.inputaddValue).value       
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }
            else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div> </div>';
            }


            // Replace the placeholder text with some actual data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },


        deleteListItem: function (selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },
        clearFields: function () {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMStrings.inputaddDescription + ',' + DOMStrings.inputaddValue);
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldsArray[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExpense, 'exp');
            if (obj.percentage > 0)
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            else
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';

        },

        displayPercentages: function (percentArray) {

            var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentArray[index] > 0)
                    current.textContent = percentArray[index] + '%';
                else
                    current.textContent = '---';
            });
        },

        displayMonthAndYear: function () {
            var now, year, month, months;

            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


            document.querySelector(DOMStrings.monthLabel).textContent = months[month] + ', ' + year;
        },

        changedType: function () {

            var fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputaddDescription + ',' + DOMStrings.inputaddValue);

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputaddButon).classList.toggle('red');
        },

        getDOMstrings: function () {
            return DOMStrings;
        }
    };


})();


// APP CONTROLER
var controller = (function (budgetctrl, UIctrl) {

    var setupEventListeners = function () {
        var DOM = UIctrl.getDOMstrings();

        document.querySelector(DOM.inputaddButon).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13)
                ctrlAddItem();
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedType);
    };


    var updateBudget = function () {
        // 1. calculate the budget
        budgetctrl.calculateBudget();
        // 2. Return the budget 
        var budget = budgetctrl.getBudget();
        // 3. Display the Budget  
        UIctrl.displayBudget(budget);
    };


    var updatePercentages = function () {
        //1. calculate the percentages
        budgetctrl.calcualtePecentages();
        //2. Read the Pecentages
        var percentages = budgetctrl.getPecentages();
        console.log(percentages);
        //3. Update the UI with new percentages
        UIctrl.displayPercentages(percentages);

    };

    var ctrlAddItem = function () {

        var input, newItem;
        //1. get the input data
        input = UIctrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. add the item to the budget controller

            newItem = budgetctrl.addItem(input.type, input.description, input.value);
            // budgetctrl.testing();

            // 3. add item to the UI
            UIctrl.addListItem(newItem, input.type);

            //4. clear the fields
            UIctrl.clearFields();
            //5. calculate the budget
            updateBudget();

            //6. calcualte and update the pecentages 
            updatePercentages();

        }


    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. delete from the data structure
            budgetctrl.deleteItem(type, ID);
            //2. delete from the UI 
            UIctrl.deleteListItem(itemID);
            //3. update and show the new budget
            updateBudget();
            //4. calcualte and update the pecentages 
            updatePercentages();
        }
    };

    return {

        init: function () {
            console.log('app has started');
            UIctrl.displayMonthAndYear();
            UIctrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);


controller.init();