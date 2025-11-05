document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('search-btn');
    const usernameInput = document.getElementById('user-input');
    const statsContainer = document.querySelector('.stats-container');
    const easyProgressCircle = document.querySelector('.easy-progress');
    const mediumProgressCircle = document.querySelector('.medium-progress');
    const hardProgressCircle = document.querySelector('.hard-progress');
    const easyLabel = document.getElementById('easy-label');
    const mediumLabel = document.getElementById('medium-label');
    const hardLabel = document.getElementById('hard-label');
    const cardStatsContainer = document.querySelector('.stats-cards');
    const displayName = document.querySelector('.display-name');

    // return true or false based on a regex
    function validateUsername(username) {
        if (username.trim() === '') {
            alert('Username should not be empty');
            return false;
        }
        const regex = /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/;
        const isMatching = regex.test(username);
        if (!isMatching) {
            alert("Invalid Username");
        }
        return isMatching;
    }

    async function fetchUserDetails(username) {

        try {
            searchButton.textContent = 'Searching...';
            searchButton.disabled = true;

            const proxyUrl = `https://cors-anywhere.herokuapp.com/`
            const targetUrl = 'https://leetcode.com/graphql/';

            const myHeaders = new Headers();
            myHeaders.append('content-type', 'application/json');

            const graphql = JSON.stringify({
                query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
                variables: { "username": `${username}` }
            })

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
            };

            const response = await fetch(proxyUrl + targetUrl, requestOptions);
            if (!response.ok) {
                throw new Error("Unable to fetch the User details")
            }
            const parsedData = await response.json();
            console.log('logging Data:', parsedData);

            displayuserData(parsedData, username);

        } catch (error) {
            statsContainer.style.display = "none"; // hide on error
            statsContainer.innerHTML = `<p>${'Username Not Found'}</P>`;
            cardStatsContainer.innerHTML = ""; // clear cards

        }
        finally {
            searchButton.disabled = false;
            searchButton.textContent = 'Search';
            usernameInput.value = '';

        }
    }

    function updateProgress(difficulty, solved,total, label, circle) {
        const progressDegree = (solved / total) * 100;
        let difficultyColor = "green"; // default: easy
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;  
        
        function difficultyColorFunc(difficulty) {
            if (difficulty === "easy") {
                difficultyColor = "green";
            } if (difficulty === "medium") {
                difficultyColor = "yellow";
            } else if (difficulty === "hard") {
                difficultyColor = "red";
            }

            // Apply dynamic background
            circle.style.background = `conic-gradient(${difficultyColor} var(--progress-degree, 40%), rgb(5, 31, 5) 0%)`;
        }

        difficultyColorFunc(difficulty);

    }


    function displayuserData(parsedData, username) {
        statsContainer.style.display = "block";
        displayName.innerHTML = `<p>Username : ${username}</p>`;

        const totalQues = parsedData.data.allQuestionsCount[0].count;
        const totalEasyQues = parsedData.data.allQuestionsCount[1].count;
        const totalMediumQues = parsedData.data.allQuestionsCount[2].count;
        const totalHardQues = parsedData.data.allQuestionsCount[3].count;

        const solvedTotalQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedTotalEasyQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedTotalMediumQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedTotalHardQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress("easy", solvedTotalEasyQues, totalEasyQues, easyLabel, easyProgressCircle);
        updateProgress("medium", solvedTotalMediumQues, totalMediumQues, mediumLabel, mediumProgressCircle);
        updateProgress("hard", solvedTotalHardQues, totalHardQues, hardLabel, hardProgressCircle);

        const cardsData = [
            { label: "Overall Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions },
            { label: "Overall Easy Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions },
            { label: "Overall Medium Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions },
            { label: "Overall Hard Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions },
        ];
        console.log('card data:', cardsData);
        // console.log(typeof(cardsData));


        cardStatsContainer.innerHTML = cardsData.map(
            data => {
                return `
                    <div class='card'>
                        <h3>${data.label}</h3>
                        <p>${data.value}</p>
                    </div>
                    `            }
        ).join('');

    }


    searchButton.addEventListener('click', function () {
        const username = usernameInput.value;
        console.log('logging username:', username);
        displayName.innerHTML = "";

        // Always hide previous data before validating
        statsContainer.style.display = "none";
        cardStatsContainer.innerHTML = ""; // optional: clear cards

        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    })
})