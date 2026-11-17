# -*- coding: utf-8 -*-
"""Built-in cities: (name, country, lat, lng, IANA time zone, default calculation method)."""
_C = [
 # United Kingdom & Ireland
 ("London","United Kingdom",51.5074,-0.1278,"Europe/London","mwl"),("Birmingham","United Kingdom",52.4862,-1.8904,"Europe/London","mwl"),
 ("Manchester","United Kingdom",53.4808,-2.2426,"Europe/London","mwl"),("Bradford","United Kingdom",53.7960,-1.7594,"Europe/London","mwl"),
 ("Leicester","United Kingdom",52.6369,-1.1398,"Europe/London","mwl"),("Leeds","United Kingdom",53.8008,-1.5491,"Europe/London","mwl"),
 ("Blackburn","United Kingdom",53.7486,-2.4875,"Europe/London","mwl"),("Luton","United Kingdom",51.8787,-0.4200,"Europe/London","mwl"),
 ("Sheffield","United Kingdom",53.3811,-1.4701,"Europe/London","mwl"),("Glasgow","United Kingdom",55.8642,-4.2518,"Europe/London","mwl"),
 ("Edinburgh","United Kingdom",55.9533,-3.1883,"Europe/London","mwl"),("Cardiff","United Kingdom",51.4816,-3.1791,"Europe/London","mwl"),
 ("Dublin","Ireland",53.3498,-6.2603,"Europe/Dublin","mwl"),
 # Pakistan
 ("Karachi","Pakistan",24.8607,67.0011,"Asia/Karachi","karachi"),("Lahore","Pakistan",31.5204,74.3587,"Asia/Karachi","karachi"),
 ("Islamabad","Pakistan",33.6844,73.0479,"Asia/Karachi","karachi"),("Rawalpindi","Pakistan",33.5651,73.0169,"Asia/Karachi","karachi"),
 ("Faisalabad","Pakistan",31.4504,73.1350,"Asia/Karachi","karachi"),("Multan","Pakistan",30.1575,71.5249,"Asia/Karachi","karachi"),
 ("Peshawar","Pakistan",34.0151,71.5249,"Asia/Karachi","karachi"),("Quetta","Pakistan",30.1798,66.9750,"Asia/Karachi","karachi"),
 ("Mirpur (AJK)","Pakistan",33.1479,73.7516,"Asia/Karachi","karachi"),
 # India
 ("Delhi","India",28.6139,77.2090,"Asia/Kolkata","karachi"),("Mumbai","India",19.0760,72.8777,"Asia/Kolkata","karachi"),
 ("Hyderabad","India",17.3850,78.4867,"Asia/Kolkata","karachi"),("Lucknow","India",26.8467,80.9462,"Asia/Kolkata","karachi"),
 ("Kolkata","India",22.5726,88.3639,"Asia/Kolkata","karachi"),("Bengaluru","India",12.9716,77.5946,"Asia/Kolkata","karachi"),
 ("Chennai","India",13.0827,80.2707,"Asia/Kolkata","karachi"),("Srinagar","India",34.0837,74.7973,"Asia/Kolkata","karachi"),
 ("Ahmedabad","India",23.0225,72.5714,"Asia/Kolkata","karachi"),("Kozhikode","India",11.2588,75.7804,"Asia/Kolkata","karachi"),
 # Bangladesh
 ("Dhaka","Bangladesh",23.8103,90.4125,"Asia/Dhaka","karachi"),("Chattogram","Bangladesh",22.3569,91.7832,"Asia/Dhaka","karachi"),
 ("Sylhet","Bangladesh",24.8949,91.8687,"Asia/Dhaka","karachi"),("Khulna","Bangladesh",22.8456,89.5403,"Asia/Dhaka","karachi"),
 ("Rajshahi","Bangladesh",24.3745,88.6042,"Asia/Dhaka","karachi"),
 # Philippines
 ("Manila","Philippines",14.5995,120.9842,"Asia/Manila","mwl"),("Cotabato City","Philippines",7.2047,124.2310,"Asia/Manila","mwl"),
 ("Marawi","Philippines",8.0034,124.2839,"Asia/Manila","mwl"),("Zamboanga","Philippines",6.9214,122.0790,"Asia/Manila","mwl"),
 ("Davao","Philippines",7.1907,125.4553,"Asia/Manila","mwl"),("Jolo","Philippines",6.0520,121.0020,"Asia/Manila","mwl"),
 # Turkey
 ("İstanbul","Türkiye",41.0082,28.9784,"Europe/Istanbul","turkey"),("Ankara","Türkiye",39.9334,32.8597,"Europe/Istanbul","turkey"),
 ("İzmir","Türkiye",38.4237,27.1428,"Europe/Istanbul","turkey"),("Bursa","Türkiye",40.1885,29.0610,"Europe/Istanbul","turkey"),
 ("Konya","Türkiye",37.8746,32.4932,"Europe/Istanbul","turkey"),("Antalya","Türkiye",36.8969,30.7133,"Europe/Istanbul","turkey"),
 ("Gaziantep","Türkiye",37.0662,37.3833,"Europe/Istanbul","turkey"),("Diyarbakır","Türkiye",37.9144,40.2306,"Europe/Istanbul","turkey"),
 # Indonesia
 ("Jakarta","Indonesia",-6.2088,106.8456,"Asia/Jakarta","kemenag"),("Surabaya","Indonesia",-7.2575,112.7521,"Asia/Jakarta","kemenag"),
 ("Bandung","Indonesia",-6.9175,107.6191,"Asia/Jakarta","kemenag"),("Medan","Indonesia",3.5952,98.6722,"Asia/Jakarta","kemenag"),
 ("Semarang","Indonesia",-6.9667,110.4167,"Asia/Jakarta","kemenag"),("Yogyakarta","Indonesia",-7.7956,110.3695,"Asia/Jakarta","kemenag"),
 ("Banda Aceh","Indonesia",5.5483,95.3238,"Asia/Jakarta","kemenag"),("Makassar","Indonesia",-5.1477,119.4327,"Asia/Makassar","kemenag"),
 ("Denpasar","Indonesia",-8.6705,115.2126,"Asia/Makassar","kemenag"),
 # Malaysia & Singapore
 ("Kuala Lumpur","Malaysia",3.1390,101.6869,"Asia/Kuala_Lumpur","jakim"),("Singapore","Singapore",1.3521,103.8198,"Asia/Singapore","jakim"),
 # Middle East
 ("Makkah","Saudi Arabia",21.3891,39.8579,"Asia/Riyadh","makkah"),("Madinah","Saudi Arabia",24.4672,39.6111,"Asia/Riyadh","makkah"),
 ("Riyadh","Saudi Arabia",24.7136,46.6753,"Asia/Riyadh","makkah"),("Jeddah","Saudi Arabia",21.4858,39.1925,"Asia/Riyadh","makkah"),
 ("Dubai","UAE",25.2048,55.2708,"Asia/Dubai","gulf"),("Abu Dhabi","UAE",24.4539,54.3773,"Asia/Dubai","gulf"),
 ("Doha","Qatar",25.2854,51.5310,"Asia/Qatar","gulf"),("Kuwait City","Kuwait",29.3759,47.9774,"Asia/Kuwait","gulf"),
 ("Manama","Bahrain",26.2285,50.5860,"Asia/Bahrain","gulf"),("Muscat","Oman",23.5880,58.3829,"Asia/Muscat","gulf"),
 ("Cairo","Egypt",30.0444,31.2357,"Africa/Cairo","egypt"),("Amman","Jordan",31.9454,35.9284,"Asia/Amman","mwl"),
 # Europe
 ("Paris","France",48.8566,2.3522,"Europe/Paris","mwl"),("Berlin","Germany",52.5200,13.4050,"Europe/Berlin","mwl"),
 ("Amsterdam","Netherlands",52.3676,4.9041,"Europe/Amsterdam","mwl"),("Brussels","Belgium",50.8503,4.3517,"Europe/Brussels","mwl"),
 ("Stockholm","Sweden",59.3293,18.0686,"Europe/Stockholm","mwl"),("Oslo","Norway",59.9139,10.7522,"Europe/Oslo","mwl"),
 # Americas
 ("New York","USA",40.7128,-74.0060,"America/New_York","isna"),("Chicago","USA",41.8781,-87.6298,"America/Chicago","isna"),
 ("Houston","USA",29.7604,-95.3698,"America/Chicago","isna"),("Dallas","USA",32.7767,-96.7970,"America/Chicago","isna"),
 ("Los Angeles","USA",34.0522,-118.2437,"America/Los_Angeles","isna"),("Detroit","USA",42.3314,-83.0458,"America/Detroit","isna"),
 ("Toronto","Canada",43.6532,-79.3832,"America/Toronto","isna"),("Montréal","Canada",45.5017,-73.5673,"America/Toronto","isna"),
 ("Vancouver","Canada",49.2827,-123.1207,"America/Vancouver","isna"),
 # Africa & Oceania
 ("Johannesburg","South Africa",-26.2041,28.0473,"Africa/Johannesburg","mwl"),("Cape Town","South Africa",-33.9249,18.4241,"Africa/Johannesburg","mwl"),
 ("Lagos","Nigeria",6.5244,3.3792,"Africa/Lagos","mwl"),("Nairobi","Kenya",-1.2921,36.8219,"Africa/Nairobi","mwl"),
 ("Sydney","Australia",-33.8688,151.2093,"Australia/Sydney","mwl"),("Melbourne","Australia",-37.8136,144.9631,"Australia/Melbourne","mwl"),
]
CITIES = [{"id": i, "n": c[0], "c": c[1], "lat": c[2], "lng": c[3], "tz": c[4], "m": c[5]} for i, c in enumerate(_C)]
