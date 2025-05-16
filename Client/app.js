document.addEventListener('DOMContentLoaded', function() {
  const skillsInput = document.getElementById('skills');
  const dropdown = document.getElementById('suggestions-dropdown');
  const getCoursesBtn = document.getElementById('get-courses-btn');
  const courseList = document.getElementById('course-list');

  let allSkills = []; 

  const baseUrl = "http://localhost:5002"; 

  fetchSkills();

  async function fetchSkills() {
    const url = `${baseUrl}/get_skills`;  
    try {
      const response = await fetch(url);
      const data = await response.json();
      allSkills = data.skills; 
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const dropdownBtn = document.querySelector(".dropbtn1");
    const dropdownContent = document.querySelector(".dropdown-content1");
  
    dropdownBtn.addEventListener("click", function (event) {
      event.stopPropagation(); 
      dropdownContent.style.display =
        dropdownContent.style.display === "block" ? "none" : "block";
    });

    function toggleDropdown() {
      document.getElementById("dropdownMenu").classList.toggle("show");
    }

    document.addEventListener("click", function (event) {
      if (!dropdownBtn.contains(event.target) && !dropdownContent.contains(event.target)) {
        dropdownContent.style.display = "none";
      }
    });
  });

  skillsInput.addEventListener('input', function() {
    const query = skillsInput.value.toLowerCase();
    dropdown.innerHTML = ''; 

    if (query.length > 0) {
      const filteredSkills = allSkills.filter(skill => skill.toLowerCase().startsWith(query));

      filteredSkills.forEach(skill => {
        const div = document.createElement('div');
        div.textContent = skill;
        div.onclick = () => {
          skillsInput.value = skill; 
          dropdown.innerHTML = ''; 
        };
        dropdown.appendChild(div);
      });

      dropdown.style.display = filteredSkills.length > 0 ? 'block' : 'none';
    } else {
      dropdown.style.display = 'none'; 
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem("user")); 
    const findSkills = document.getElementById("findSkills");
    const recommendedCourses = document.getElementById("recommendedCourses");
  
    function restrictAccess(button) {
      button.addEventListener("click", function (event) {
        if (!user) {
          event.preventDefault(); 
          alert("You need to sign in first!");
          window.location.href = "signin.html"; 
        }
      });
    }
  
    restrictAccess(findSkills);
    restrictAccess(recommendedCourses);
  });

  getCoursesBtn.addEventListener('click', async function() {
    const inputSkills = skillsInput.value.trim();

    if (inputSkills) {
      const url = `${baseUrl}/predict`; 
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ input: inputSkills })  
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.length > 0) {
          const ul = document.createElement('ul');
          data.forEach(course => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = course.URL;
            a.textContent = course.Title;
            a.target = '_blank'; 
            li.appendChild(a);
            ul.appendChild(li);
          });
          courseList.innerHTML = ''; 
          courseList.appendChild(ul);
        } else {
          courseList.innerHTML = 'No courses found.';
        }
      } catch (error) {
        console.error('Error fetching recommended courses:', error);
        courseList.innerHTML = 'Error fetching courses. Please check the console for more details.';
      }
    } else {
      alert('Please enter a skill.');
    }
  });
});
