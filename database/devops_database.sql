CREATE TABLE Recipe(
       student_id INT PRIMARY KEY AUTO_INCREMENT, 
       recipe_name VARCHAR(60), 
       recipe_cost INT
);


ALTER USER 'root' IDENTIFIED WITH mysql_native_password BY 'password'; 
flush privileges;