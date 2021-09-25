INSERT INTO "Users" ("id","email","verified","pwHash","name","createdAt","updatedAt") VALUES (DEFAULT,'email1@gmail.com',true,'$2b$10$v3qgumBibz8Uouevm5xeTOFWheNtLVRyLeGqp2tZbfdMJ.iHQtgVq','bot','2021-09-24 14:26:11.566 +00:00','2021-09-24 14:26:11.566 +00:00'),(DEFAULT,'email2@gmail.com',true,'$2b$10$v3qgumBibz8Uouevm5xeTOFWheNtLVRyLeGqp2tZbfdMJ.iHQtgVq','bot','2021-09-24 14:26:11.566 +00:00','2021-09-24 14:26:11.566 +00:00'),(DEFAULT,'email3@gmail.com',true,'$2b$10$v3qgumBibz8Uouevm5xeTOFWheNtLVRyLeGqp2tZbfdMJ.iHQtgVq','bot','2021-09-24 14:26:11.566 +00:00','2021-09-24 14:26:11.566 +00:00'),(DEFAULT,'email4@gmail.com',true,'$2b$10$v3qgumBibz8Uouevm5xeTOFWheNtLVRyLeGqp2tZbfdMJ.iHQtgVq','bot','2021-09-24 14:26:11.566 +00:00','2021-09-24 14:26:11.566 +00:00'),(DEFAULT,'email5@gmail.com',false,'$2b$10$v3qgumBibz8Uouevm5xeTOFWheNtLVRyLeGqp2tZbfdMJ.iHQtgVq','bot','2021-09-24 14:26:11.566 +00:00','2021-09-24 14:26:11.566 +00:00'),(DEFAULT,'email6@gmail.com',false,'$2b$10$v3qgumBibz8Uouevm5xeTOFWheNtLVRyLeGqp2tZbfdMJ.iHQtgVq','bot','2021-09-24 14:26:11.566 +00:00','2021-09-24 14:26:11.566 +00:00') RETURNING "id","email","verified","pwHash","name","createdAt","updatedAt";
INSERT INTO "Leagues" ("id","name","adminId","ispublic","createdAt","updatedAt") VALUES (DEFAULT,'Ball Street',1,true,'2021-09-24 14:26:11.573 +00:00','2021-09-24 14:26:11.573 +00:00'),(DEFAULT,'Ball Street Private',2,false,'2021-09-24 14:26:11.573 +00:00','2021-09-24 14:26:11.573 +00:00'),(DEFAULT,'Ball Street Public2',1,true,'2021-09-24 14:26:11.573 +00:00','2021-09-24 14:26:11.573 +00:00') RETURNING "id","name","adminId","ispublic","createdAt","updatedAt";
INSERT INTO "Memberships" ("UserId","LeagueId","createdAt","updatedAt") VALUES (1,1,'2021-09-24 14:26:11.579 +00:00','2021-09-24 14:26:11.579 +00:00'),(2,1,'2021-09-24 14:26:11.579 +00:00','2021-09-24 14:26:11.579 +00:00'),(3,1,'2021-09-24 14:26:11.579 +00:00','2021-09-24 14:26:11.579 +00:00') RETURNING "UserId","LeagueId","createdAt","updatedAt";
INSERT INTO "Memberships" ("UserId","LeagueId","createdAt","updatedAt") VALUES (1,2,'2021-09-24 14:26:11.585 +00:00','2021-09-24 14:26:11.585 +00:00'),(2,2,'2021-09-24 14:26:11.585 +00:00','2021-09-24 14:26:11.585 +00:00'),(3,2,'2021-09-24 14:26:11.585 +00:00','2021-09-24 14:26:11.585 +00:00'),(1,3,'2021-09-24 14:26:11.585 +00:00','2021-09-24 14:26:11.585 +00:00') RETURNING "UserId","LeagueId","createdAt","updatedAt";
INSERT INTO "Contests" ("id","name","nflweek","LeagueId","budget","createdAt","updatedAt") VALUES (DEFAULT,'Ball Street Big One',1,1,10000,'2021-09-24 14:26:11.591 +00:00','2021-09-24 14:26:11.591 +00:00'),(DEFAULT,'Private Contest',1,2,10000,'2021-09-24 14:26:11.591 +00:00','2021-09-24 14:26:11.591 +00:00'),(DEFAULT,'Public Contest 2',1,3,10000,'2021-09-24 14:26:11.591 +00:00','2021-09-24 14:26:11.591 +00:00') RETURNING "id","name","nflweek","LeagueId","budget","createdAt","updatedAt";
INSERT INTO "Entries" ("pointtotal","UserId","ContestId","RB1","createdAt","updatedAt") VALUES (10000,1,1,31885,'2021-09-24 14:26:11.603 +00:00','2021-09-24 14:26:11.603 +00:00'),(10000,2,1,31885,'2021-09-24 14:26:11.603 +00:00','2021-09-24 14:26:11.603 +00:00'),(10000,3,1,31885,'2021-09-24 14:26:11.603 +00:00','2021-09-24 14:26:11.603 +00:00') RETURNING "pointtotal","UserId","ContestId","QB1","RB1","RB2","WR1","WR2","TE1","FLEX1","FLEX2","K1","DEF1","createdAt","updatedAt";
INSERT INTO "Entries" ("pointtotal","UserId","ContestId","RB1","K1","DEF1","createdAt","updatedAt","WR1","WR2") VALUES (10000,1,2,31885,30266,21,'2021-09-24 14:26:11.611 +00:00','2021-09-24 14:26:11.611 +00:00',NULL,NULL),(1500,2,2,31885,30266,NULL,'2021-09-24 14:26:11.611 +00:00','2021-09-24 14:26:11.611 +00:00',32398,28026),(500,3,2,31885,30266,NULL,'2021-09-24 14:26:11.611 +00:00','2021-09-24 14:26:11.611 +00:00',NULL,NULL) RETURNING "pointtotal","UserId","ContestId","QB1","RB1","RB2","WR1","WR2","TE1","FLEX1","FLEX2","K1","DEF1","createdAt","updatedAt";
INSERT INTO "Offers" ("id","isbid","price","protected","filled","cancelled","UserId","ContestId","NFLPlayerId","createdAt","updatedAt") VALUES ('16c94b61-3c76-4078-8fbc-67fac7ed26c2',false,8000,false,false,false,1,1,31885,'2021-09-24 14:26:11.632 +00:00','2021-09-24 14:26:11.632 +00:00'),('16c94b61-3c76-4078-8fbc-67fac7ed26c3',false,8000,false,false,true,2,1,31885,'2021-09-24 14:26:11.632 +00:00','2021-09-24 14:26:11.632 +00:00'),('16c94b61-3c76-4078-8fbc-67fac7ed26c4',false,8000,false,true,false,3,1,31885,'2021-09-24 14:26:11.632 +00:00','2021-09-24 14:26:11.632 +00:00'),('16c94b61-3c76-4078-8fbc-67fac7ed26c6',true,8000,false,true,false,1,1,31885,'2021-09-24 14:26:11.632 +00:00','2021-09-24 14:26:11.632 +00:00'),('16c94b61-3c76-4078-8fbc-67fac7ed26c5',false,8000,false,false,false,2,2,31885,'2021-09-24 14:26:11.632 +00:00','2021-09-24 14:26:11.632 +00:00') RETURNING "id","isbid","price","protected","filled","cancelled","UserId","ContestId","NFLPlayerId","createdAt","updatedAt";
INSERT INTO "Trades" ("price","bidId","askId","createdAt","updatedAt") VALUES (8000,'16c94b61-3c76-4078-8fbc-67fac7ed26c6','16c94b61-3c76-4078-8fbc-67fac7ed26c4','2021-09-24 14:26:11.670 +00:00','2021-09-24 14:26:11.670 +00:00') RETURNING "price","bidId","askId","createdAt","updatedAt";
INSERT INTO "NFLGames" ("week","HomeId","AwayId","createdAt","updatedAt","phase") VALUES (1,10,1,'2021-09-24 14:26:11.694 +00:00','2021-09-24 14:26:11.694 +00:00',NULL),(1,33,2,'2021-09-24 14:26:11.694 +00:00','2021-09-24 14:26:11.694 +00:00','pre'),(1,29,3,'2021-09-24 14:26:11.694 +00:00','2021-09-24 14:26:11.694 +00:00',NULL),(1,4,5,'2021-09-24 14:26:11.694 +00:00','2021-09-24 14:26:11.694 +00:00',NULL),(1,6,7,'2021-09-24 14:26:11.694 +00:00','2021-09-24 14:26:11.694 +00:00',NULL),(1,8,9,'2021-09-24 14:26:11.694 +00:00','2021-09-24 14:26:11.694 +00:00',NULL),(1,34,11,'2021-09-24 14:26:11.694 +00:00','2021-09-24 14:26:11.694 +00:00',NULL),(1,30,12,'2021-09-24 14:26:11.694 +00:00','2021-09-24 14:26:11.694 +00:00','pre'),(1,15,16,'2021-09-24 14:26:11.694 +00:00','2021-09-24 14:26:11.694 +00:00',NULL),(1,17,18,'2021-09-24 14:26:11.694 +00:00','2021-09-24 14:26:11.694 +00:00','pre'),(1,19,20,'2021-09-24 14:26:11.694 +00:00','2021-09-24 14:26:11.694 +00:00',NULL),(1,13,21,'2021-09-24 14:26:11.694 +00:00','2021-09-24 14:26:11.694 +00:00','mid'),(1,23,24,'2021-09-24 14:26:11.694 +00:00','2021-09-24 14:26:11.694 +00:00','mid'),(1,25,26,'2021-09-24 14:26:11.694 +00:00','2021-09-24 14:26:11.694 +00:00','mid'),(1,14,27,'2021-09-24 14:26:11.694 +00:00','2021-09-24 14:26:11.694 +00:00',NULL),(1,22,28,'2021-09-24 14:26:11.694 +00:00','2021-09-24 14:26:11.694 +00:00','pre') RETURNING "week","HomeId","AwayId","phase","createdAt","updatedAt";