CREATE DATABASE movie_recommendation;

USE movie_recommendation;

CREATE TABLE movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100),
  genre VARCHAR(50),
  rating FLOAT,
  release_year INT
);
-- DRAMA: English
INSERT INTO movies (title, genre, rating, release_year) VALUES
('The Shawshank Redemption', 'Drama', 9.3, 1994),
('Forrest Gump', 'Drama', 8.8, 1994),
('Fight Club', 'Drama', 8.8, 1999),
('The Godfather', 'Drama', 9.2, 1972),

-- DRAMA: Malayalam
('Drishyam', 'Drama', 8.6, 2013),
('Bangalore Days', 'Drama', 8.3, 2014),
('Maheshinte Prathikaaram', 'Drama', 8.2, 2016),
('Uyare', 'Drama', 8.3, 2019),

-- DRAMA: Hindi
('Taare Zameen Par', 'Drama', 8.4, 2007),
('Swades', 'Drama', 8.2, 2004),
('Paa', 'Drama', 7.8, 2009),
('Kapoor & Sons', 'Drama', 7.7, 2016),

-- DRAMA: Tamil
('Vaaranam Aayiram', 'Drama', 8.1, 2008),
('Pariyerum Perumal', 'Drama', 8.5, 2018),
('Aadukalam', 'Drama', 8.1, 2011),
('Soorarai Pottru', 'Drama', 9.0, 2020),

-- HORROR: English
('Get Out', 'Horror', 7.7, 2017),
('The Shining', 'Horror', 8.4, 1980),
('Hereditary', 'Horror', 7.3, 2018),
('The Exorcist', 'Horror', 8.0, 1973),

-- HORROR: Malayalam
('Chathur Mukham', 'Horror', 6.6, 2021),
('Bramayugam', 'Horror', 8, 2024),
('Ezra', 'Horror', 7.0, 2017),
('Manichitrathazhu', 'Horror', 8.2, 1993),

-- HORROR: Hindi
('Tumbbad', 'Horror', 8.3, 2018),
('Raaz', 'Horror', 5.8, 2002),
('Pari', 'Horror', 6.6, 2018),
('Ek Thi Daayan', 'Horror', 5.7, 2013),

-- HORROR: Tamil
('Pizza', 'Horror', 7.1, 2012),
('Demonte Colony', 'Horror', 6.4, 2015),
('Aval', 'Horror', 7.0, 2017),
('Maya', 'Horror', 6.7, 2015),

-- SCIFI: English
('Interstellar', 'SciFi', 8.6, 2014),
('The Matrix', 'SciFi', 8.7, 1999),
('Blade Runner 2049', 'SciFi', 8.0, 2017),
('Arrival', 'SciFi', 7.9, 2016),

-- SCIFI: Malayalam
('Android Kunjappan Version 5.25', 'SciFi', 7.8, 2019),
('Samara', 'SciFi', 7.6, 2023),
('Kuttavum Shikshayum', 'SciFi', 8.9, 2022),
('Neelakasham Pachakadal Chuvanna Bhoomi', 'SciFi', 7.2, 2013),

-- SCIFI: Hindi
('Koi… Mil Gaya', 'SciFi', 7.1, 2003),
('PK', 'SciFi', 8.1, 2014),
('Ra.One', 'SciFi', 5.4, 2011),
('Robot', 'SciFi', 7.1, 2010),

-- SCIFI: Tamil
('Enthiran', 'SciFi', 7.2, 2010),
('2.0', 'SciFi', 6.0, 2018),
('Indru Netru Naalai', 'SciFi', 7.5, 2015),
('Tik Tik Tik', 'SciFi', 5.9, 2018),

-- FANTASY: English
('The Lord of the Rings: The Fellowship of the Ring', 'Fantasy', 8.8, 2001),
('Harry Potter and the Sorcerer''s Stone', 'Fantasy', 7.6, 2001),
('Pan''s Labyrinth', 'Fantasy', 8.2, 2006),
('Spirited Away', 'Fantasy', 8.6, 2001),

-- FANTASY: Malayalam
('My Dear Kuttichathan', 'Fantasy', 7.0, 1984),
('Minnaram', 'Fantasy', 8.8, 1994),
('Bhaskar The Rascal', 'Fantasy', 6.5, 2015),
('Kulir 100°', 'Fantasy', 8.7, 2009),

-- FANTASY: Hindi
('Koi… Mil Gaya', 'Fantasy', 7.1, 2003),
('Paheli', 'Fantasy', 6.7, 2005),
('Jagga Jasoos', 'Fantasy', 6.5, 2017),
('Tumbbad', 'Fantasy', 8.3, 2018),

-- FANTASY: Tamil
('Aayirathil Oruvan', 'Fantasy', 7.0, 2010),
('Ponniyin Selvan: I', 'Fantasy', 8.3, 2022),
('Ponniyin Selvan: II', 'Fantasy', 8.4, 2023),
('Aayirathil Oruvan', 'Fantasy', 7.0, 2010),

-- ROMANCE: English
('The Notebook', 'Romance', 7.8, 2004),
('Pride & Prejudice', 'Romance', 7.8, 2005),
('La La Land', 'Romance', 8.0, 2016),
('Titanic', 'Romance', 7.8, 1997),

-- ROMANCE: Malayalam
('Aniyathipraavu', 'Romance', 7.3, 1997),
('Neelakasham Pachakadal Chuvanna Bhoomi', 'Romance', 7.2, 2013),
('Ennu Ninte Moideen', 'Romance', 8.4, 2015),
('Premam', 'Romance', 8.2, 2015),

-- ROMANCE: Hindi
('Dilwale Dulhania Le Jayenge', 'Romance', 8.1, 1995),
('Kuch Kuch Hota Hai', 'Romance', 7.6, 1998),
('Kabir Singh', 'Romance', 7.1, 2019),
('Aashiqui 2', 'Romance', 7.0, 2013),

-- ROMANCE: Tamil
('Vinnaithaandi Varuvaayaa', 'Romance', 7.7, 2010),
('Kadhal', 'Romance', 7.2, 2004),
('96', 'Romance', 8.5, 2018),
('Pariyerum Perumal', 'Romance', 8.5, 2018),

-- THRILLER: English
('Se7en', 'Thriller', 8.6, 1995),
('Gone Girl', 'Thriller', 8.1, 2014),
('Shutter Island', 'Thriller', 8.2, 2010),
('Memento', 'Thriller', 8.4, 2000),

-- THRILLER: Malayalam
('Mumbai Police', 'Thriller', 8.3, 2013),
('Drishyam', 'Thriller', 8.6, 2013),
('Anjaam Pathiraa', 'Thriller', 7.9, 2020),
('Memories', 'Thriller', 7.5, 2013),

-- THRILLER: Hindi
('Andhadhun', 'Thriller', 8.3, 2018),
('Kahaani', 'Thriller', 8.1, 2012),
('Drishyam', 'Thriller', 8.2, 2015),
('A Wednesday', 'Thriller', 8.1, 2008),

-- THRILLER: Tamil
('Ratsasan', 'Thriller', 8.5, 2018),
('Vikram Vedha', 'Thriller', 8.5, 2017),
('Papanasam', 'Thriller', 8.6, 2015),
('Dhuruvangal Pathinaaru', 'Thriller', 8.6, 2016),

-- DOCUMENTARY: English
('Free Solo', 'Documentary', 8.2, 2018),
('13th', 'Documentary', 8.2, 2016),
('The Cove', 'Documentary', 8.4, 2009),
('Blackfish', 'Documentary', 8.1, 2013),

-- DOCUMENTARY: Malayalam
('Lalitham', 'Documentary', 6.7, 2019),
('Suo Moto', 'Documentary', 3.6, 2020),
('100 Years of Malayalam Cinema', 'Documentary', 4.5, 2022),
('Njaan Kanda Kerala', 'Documentary', 7.4, 2021),

-- DOCUMENTARY: Hindi
('An Insignificant Man', 'Documentary', 7.2, 2016),
('Supermen of Malegaon', 'Documentary', 8.0, 2012),
('The World Before Her', 'Documentary', 7.4, 2012),
('India: The Modi Question', 'Documentary', 7.1, 2023),

-- DOCUMENTARY: Tamil
('Peranbu', 'Documentary', 5.2, 2022),
('Katchatheevu', 'Documentary', 5.2, 2020),
('Aarambam', 'Documentary', 7.4, 2018),
('Kural 146', 'Documentary', 5.4, 2019),

-- ANIMATION: English
('Toy Story', 'Animation', 8.3, 1995),
('Spirited Away', 'Animation', 8.6, 2001),
('Inside Out', 'Animation', 8.2, 2015),
('The Lion King', 'Animation', 8.5, 1994),

-- ANIMATION: Malayalam
('Once Upon a Time', 'Animation', 8.6, 2013),
('Kuttichathan', 'Animation', 7.0, 1984),
('Kallan D''Souza', 'Animation', 4.6, 2013),
('Adventures of Lallu', 'Animation', 5.7, 2012),

-- ANIMATION: Hindi
('Hanuman', 'Animation', 7.1, 2005),
('Chhota Bheem and the Curse of Damyaan', 'Animation', 6.8, 2012),
('Roadside Romeo', 'Animation', 5.3, 2008),
('Motu Patlu: King of Kings', 'Animation', 6.0, 2016),

-- ANIMATION: Tamil
('Kochadaiiyaan', 'Animation', 5.5, 2014),
('Koochie Koochie', 'Animation', 3.6, 2015),
('Alibaba', 'Animation', 6.9, 2016),
('Saalaiyin Theerpu', 'Animation', 7.8, '2017');

	select database();
	