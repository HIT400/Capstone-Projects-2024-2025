# Inspector Creation Script

This script adds 28 inspectors to the ZimBuilds system with randomized details.

## Details

The script will:
1. Create user accounts for each inspector
2. Assign random districts and inspection types
3. Generate unique work IDs, license numbers, and contact information
4. Set a default password of "Password123!" for all inspectors

## How to Run

From the project root directory, run:

```bash
# Navigate to the backend directory
cd backend

# Run the script using Node.js with ES modules support
node --experimental-modules src/scripts/add_inspectors.js
```

## Inspector List

The script will add the following inspectors:
1. Tawanda Mudzamiri
2. Vimbai Chikowore
3. Tatenda Nyamupaguma
4. Tinashe Mugabe
5. Rujeko Makamure
6. Farai Muchengeti
7. Chenai Zvinavashe
8. Munyaradzi Mavhunga
9. Tafadzwa Chingono
10. Tariro Gweshe
11. Shamiso Mutasa
12. Ratidzo Makoni
13. Kudakwashe Choto
14. Mufaro Chidembo
15. Tanaka Vheremu
16. Chiedza Mataranyika
17. Tendai Gombedza
18. Runako Manyika
19. Kudzanai Bvumbe
20. Makanaka Mhondoro
21. Ruvimbo Mutandwa
22. Anesu Jabangwe
23. Rutendo Muzenda
24. Nyasha Chaurura
25. Simbarashe Mabika
26. Maruva Hanyani
27. Tanyaradzwa Chikafu
28. Takudzwa Muzamhindo

## Email Format

All inspectors will have email addresses in the format:
`firstnamelastname@zimbuilds.com`

For example: `tawandamudzamiri@zimbuilds.com`

## Default Password

All inspectors will have the same default password: `Password123!`

This should be changed after first login for security purposes.
