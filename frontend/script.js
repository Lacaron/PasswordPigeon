// Variables
const separatorsDictionary = {
    Hyphens: '-',
    Spaces: ' ',
    Periods: '.',
    Commas: ',',
    Underscores: '_'
};

// Lexique
const file = './resources/unique_words.csv'
let frenchWords = [];

document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const rangeInput = document.getElementById('passwordLength');
    const capitalLettersCheckbox = document.getElementById('capitalLetters');
    const numbersCheckbox = document.getElementById('numbers');
    const separatorSelect = document.getElementById('inputSeparator');
    const sliderValueLabel = document.getElementById('sliderValue');
    const regenerateButton = document.getElementById('regenerateButton');
    const copyButton = document.getElementById('copyButton');

    // Output
    const passphraseDisplay = document.getElementById('passphraseDisplay');
    const scoreBar = document.getElementById('scoreBar');
    const scoreText = document.getElementById('scoreText');

    // Load words from file
    const loadWords = async () => {
        try {
            const response = await fetch(file);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.text();
            frenchWords = data.split('\n').filter(word => word.trim() !== '');
        } catch (error) {
            console.error('Error fetching the file:', error);
        }
    };

    // Function to populate the dropdown
    const populateSeparators = () => {
        separatorSelect.innerHTML = '';

        Object.keys(separatorsDictionary).forEach(key => {
            const option = document.createElement('option');
            option.value = key; // Use the key as the value
            option.textContent = key;
            separatorSelect.appendChild(option);
        });
    };

    // Function to update the password length display
    const updateSliderValue = (value) => {
        sliderValueLabel.textContent = `Password Length: ${value}`;
    };

    const updateScoreGraph = (percent, color) => {
        scoreBar.style.width = percent + '%';
        scoreBar.className = 'bg-' + color + '-500 h-4 rounded-full';
    }

    const updateScore = async (passphrase) => {
        // Calculate score
        const passphraseScore = new passphraseScoring();

        let score = passphraseScore.calculateScore(passphrase);
        let time = passphraseScore.calculateCrackTime(passphrase);
        let color = '';

        if (score < 60) {
            color = 'red';
        } else if (score < 90) {
            color = 'orange';
        } else {
            color = 'green';
        }
        // 0: { score: "very weak", style: { color: "red" } },
        // 1: { score: "very weak", style: { color: "red" } },
        // 2: { score: "weak", style: { color: "orange" } },
        // 3: { score: "good", style: { color: "blue" } },
        // 4: { score: "strong", style: { color: "green" } },

        // updateScoreGraph(percentage, color);
        scoreBar.style.width = score + '%';
        scoreBar.className = 'bg-' + color + '-500 h-4 rounded-full';
        
        // updateScoreText
        scoreText.textContent = time;
        scoreText.className = 'text-' + color + '-500';

        console.log("breach? ", await passphraseScore.checkBreach(passphrase));
    }

    function colorizeString(input) {
        // Regular expressions for identifying character types
        const uppercaseRegex = /[A-Z]/;
        const numberRegex = /[0-9]/;
        const specialCharRegex = /[-_!@#$%^&*(),.?":{}|<> ]/;
    
        // Map each character to a span with the appropriate color
        const coloredString = Array.from(input).map(char => {
            let className = '';
    
            if (uppercaseRegex.test(char)) {
                className = 'text-yellow-500'; // Green for uppercase letters
            } else if (numberRegex.test(char)) {
                className = 'text-blue-500'; // Blue for numbers
            } else if (specialCharRegex.test(char)) {
                className = 'text-orange-500'; // Orange for special characters
            } else {
                className = 'text-black'; // Default color for lowercase letters and spaces
            }
    
            return `<span class="${className}">${char}</span>`;
        }).join('');
    
        return coloredString;
    }

    const generatePassphrase = () => {
        const length = parseInt(rangeInput.value);
        const useCapitalLetters = capitalLettersCheckbox.checked;
        const useNumbers = numbersCheckbox.checked;
        const separator = separatorsDictionary[separatorSelect.value];

        const generator = new Passphrase(length, useCapitalLetters, useNumbers, separator, frenchWords);

        let passphrase = generator.generatePassphrase();

        passphrase = colorizeString(passphrase);

        passphraseDisplay.innerHTML = passphrase;

        updateScore(passphrase);
    }



    // EVENT LISTENERS
    rangeInput.addEventListener('input', (event) => {
        updateSliderValue(event.target.value);
        generatePassphrase();
    });

    capitalLettersCheckbox.addEventListener('change', () => {
        generatePassphrase();
    });

    numbersCheckbox.addEventListener('change', () => {
        generatePassphrase();
    });

    separatorSelect.addEventListener('change', () => {
        generatePassphrase();
    });

    regenerateButton.addEventListener('click', () => {
        generatePassphrase();
    });

    copyButton.addEventListener('click', () => {
        const passphraseDisplay = document.getElementById('passphraseDisplay');
        const copyButton = document.getElementById('copyButton');

        navigator.clipboard.writeText(passphraseDisplay.textContent)
            .then(() => {
                const originalText = copyButton.textContent; // Save original button text
                copyButton.textContent = 'Copied!'; // Change button text

                // Reset the button text after 3 seconds
                setTimeout(() => {
                    copyButton.textContent = originalText; // Restore original text
                }, 3000);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });
    });



    // Initial display update
    const main = async () => {
        await loadWords();
        populateSeparators();
        updateSliderValue(rangeInput.value);
        generatePassphrase();
    };

    main();
});






class passphraseScoring {
    constructor() {

    }

    calculatePasswordEntropy = (passphrase) => {
        // Determine the range of character types in the password
        const ranges = {
            numerics: 10,    // 0-9
            lowercase: 26,    // a-z
            uppercase: 26,    // A-Z
            special: 32       // !, @, %, $
        };

        let range = 0;

        // Check for the presence of different character types
        if (/[0-9]/.test(passphrase)) range += ranges.numerics;
        if (/[a-z]/.test(passphrase)) range += ranges.lowercase;
        if (/[A-Z]/.test(passphrase)) range += ranges.uppercase;
        // Check for special characters explicitly
        if (/[-_!@#$%^&*(),.?":{}|<> ]/.test(passphrase)) {
            range += ranges.special;
        }

        // Calculate entropy: E = L × log2(R)
        const entropy = passphrase.length * Math.log2(range);
        return Math.floor(entropy); // Floor because does not work with point
    }

    calculateCrackTime = (passphrase) => {
        // Determine the range of character types in the password
        const ranges = {
            numerics: 10,    // 0-9
            lowercase: 26,    // a-z
            uppercase: 26,    // A-Z
            special: 32       // !, @, %, $
        };

        let range = 0;

        // Check for the presence of different character types
        if (/[0-9]/.test(passphrase)) range += ranges.numerics;
        if (/[a-z]/.test(passphrase)) range += ranges.lowercase;
        if (/[A-Z]/.test(passphrase)) range += ranges.uppercase;
        // Check for special characters explicitly
        if (/[-_!@#$%^&*(),.?":{}|<> ]/.test(passphrase)) {
            range += ranges.special;
        }
        console.log("range", range)

        // Calculate entropy: E = L × log2(R)
        const entropy = Math.floor(passphrase.length * Math.log2(range));
        console.log("entropy", entropy)

        // Calculate time to crack
        const guessesPerSecond = 1e9; // 1 billion guesses per second
        const timeToCrackSeconds = Math.pow(2, entropy) / guessesPerSecond;
        console.log("timeToCrackSeconds", timeToCrackSeconds)

        // Convert seconds to a readable format
        function formatTime(seconds) {
            const units = [
                { label: "Thousands of years", seconds: 3.15576e+9 * 1000 },
                { label: "centuries", seconds: 3.15576e+9 * 100 },
                { label: "years", seconds: 3.15576e+9 },
                { label: "months", seconds: 2.62974e+6 },
                { label: "weeks", seconds: 604800 },
                { label: "days", seconds: 86400 },
                { label: "hours", seconds: 3600 },
                { label: "minutes", seconds: 60 },
                { label: "seconds", seconds: 1 },
            ];

            for (let { label, seconds: unitSeconds } of units) {
                const time = Math.floor(seconds / unitSeconds);
                if (time > 0) {
                    return `${label}`;
                }
                seconds %= unitSeconds;
            }
            return "less than a second"; // If all else fails
        }

        const estimatedTime = formatTime(timeToCrackSeconds);
        console.log("estimatedTime", estimatedTime)

        return estimatedTime;
    }

    // Returns a score from 0 to 100
    calculateScore = (passphrase) => {
        let range = 0;

        // Determine the range of character types in the password
        const ranges = {
            numerics: 1,    // 0-9
            lowercase: 1,    // a-z
            uppercase: 1,    // A-Z
            special: 1,      // !, @, %, $
            minLength: 1
        };
        const maxRange = 5;

        // Check for the presence of different character types
        if (/[0-9]/.test(passphrase)) range += ranges.numerics;
        if (/[a-z]/.test(passphrase)) range += ranges.lowercase;
        if (/[A-Z]/.test(passphrase)) range += ranges.uppercase;
        if (/[-_!@#$%^&*(),.?":{}|<> ]/.test(passphrase)) range += ranges.special;
        if (/^.{12,}$/.test(passphrase)) range += ranges.minLength;

        const score = (range / maxRange) * 100
        console.log("score", score)

        return score;
    }

    checkBreach = async (passphrase) => {


        // Hash the passphrase using SHA-1
        const hash = CryptoJS.SHA1(passphrase).toString();

        // Extract prefix and postfix
        const prefix = hash.substring(0, 5);
        const postfix = hash.substring(5);

        // Send the prefix to a URL with a CORS proxy
        const url = '/api/breach/' + prefix; // Replace with your URL
        let response;

        try {
            response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Network response was not ok.');

            const responseText = await response.text();

            // Check if the postfix exists in the response list
            const list = responseText
                .trim() // Remove any leading or trailing whitespace
                .split('\r\n') // Split the string into lines
                .map(line => line.split(':')[0]); // Extract the first part of each line

            const postfixExists = list.includes(postfix.toUpperCase());


            return postfixExists;

        } catch (error) {
            console.error('Error:', error);
        }
    }
}




async function checkIsBreached(password) {

    // Hash the password using SHA-1
    const hash = CryptoJS.SHA1(password).toString();

    // Extract prefix and postfix
    const prefix = hash.substring(0, 5);
    const postfix = hash.substring(5);

    // Send the prefix to a URL with a CORS proxy
    const url = 'https://cors-anywhere.herokuapp.com/' + 'https://api.pwnedpasswords.com/range/' + prefix; // Replace with your URL
    let response;

    try {
        response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) throw new Error('Network response was not ok.');

        const responseText = await response.text();

        // Check if the postfix exists in the response list
        const list = responseText
            .trim() // Remove any leading or trailing whitespace
            .split('\r\n') // Split the string into lines
            .map(line => line.split(':')[0]); // Extract the first part of each line

        const postfixExists = list.includes(postfix.toUpperCase());


        return !postfixExists;

    } catch (error) {
        console.error('Error:', error);
    }
}




class Passphrase {
    constructor(length, useCapitalLetters, useNumbers, separator, dictionary) {
        this.length = length;
        this.useCapitalLetters = useCapitalLetters;
        this.useNumbers = useNumbers;
        this.separator = separator;
        this.dictionary = dictionary;
    }

    getRandomWords = (numWords) => {
        const randomWords = [];

        for (let i = 0; i < numWords; i++) {
            const randomIndex = Math.floor(Math.random() * this.dictionary.length);
            randomWords.push(frenchWords[randomIndex]);
        }

        return randomWords
    }

    capitalizeFirstLetter(words) {
        return words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    }

    addRandomNumber(words) {
        return words.map(word => {
            const randomNumber = Math.floor(Math.random() * 10); // Generate a random number between 0 and 9
            return `${word}${randomNumber}`;
        });
    }

    joinWordsWithSymbol(words, symbol) {
        return words.join(symbol);
    }

    generatePassphrase = () => {
        let passphrase = '';

        let words = this.getRandomWords(this.length);

        if (this.useCapitalLetters) {
            words = this.capitalizeFirstLetter(words);
        }

        if (this.useNumbers) {
            words = this.addRandomNumber(words);
        }

        // Add separators if needed
        if (this.separator) {
            passphrase = this.joinWordsWithSymbol(words, this.separator);
        }

        // Update the display
        return passphrase;
    };
}











