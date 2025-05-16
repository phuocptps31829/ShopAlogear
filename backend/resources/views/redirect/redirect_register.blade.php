<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kích Hoạt Thành Công</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-top: 20%;
        }
        h1 {
            color: green;
        }
        p {
            font-size: 18px;
        }
        #redirect-btn {
            padding: 10px 20px;
            font-size: 16px;
            background-color: blue;
            color: white;
            border: none;
            cursor: pointer;
            margin-top: 15px;
        }
        #redirect-btn:hover {
            background-color: darkblue;
        }
    </style>
</head>
<body>

<h1>Kích Hoạt Tài Khoản Thành Công</h1>
<p>Bạn sẽ được chuyển hướng sau <span id="countdown">5</span> giây...</p>
<button id="redirect-btn">Chuyển Hướng Ngay</button>

<script>
    let seconds = 5; // Thời gian đếm ngược
    let redirectUrl = "{{ env('URL_FRONTEND') }}/account/login"; // Link chuyển hướng

    function updateCountdown() {
        document.getElementById("countdown").textContent = seconds;
        if (seconds <= 0) {
            window.location.href = redirectUrl;
        } else {
            seconds--;
            setTimeout(updateCountdown, 1000);
        }
    }

    document.getElementById("redirect-btn").addEventListener("click", function() {
        window.location.href = redirectUrl;
    });

    updateCountdown(); // Bắt đầu đếm ngược
</script>

</body>
</html>
