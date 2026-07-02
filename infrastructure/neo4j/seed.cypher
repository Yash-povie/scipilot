CREATE CONSTRAINT FOR (p:Paper) REQUIRE p.doi IS UNIQUE;
CREATE CONSTRAINT FOR (a:Author) REQUIRE a.name IS UNIQUE;
CREATE CONSTRAINT FOR (c:Compound) REQUIRE c.name IS UNIQUE;
CREATE (c:Compound {name: "Aspirin"})-[:FOUND_IN]->(p:Paper {doi: "10.1000/xyz123"});
