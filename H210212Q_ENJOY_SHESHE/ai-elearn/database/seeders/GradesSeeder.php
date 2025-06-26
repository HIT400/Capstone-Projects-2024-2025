<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class GradesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('grades')->insert([

            [
                'grade_letter' => 'A+',
                'min_score' => 90,
                'max_score' => 100,
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'grade_letter' => 'A',
                'min_score' => 75,
                'max_score' => 89,
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'grade_letter' => 'B',
                'min_score' => 60,
                'max_score' => 74,
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'grade_letter' => 'C',
                'min_score' => 50,
                'max_score' => 59,
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'grade_letter' => 'D',
                'min_score' => 45,
                'max_score' => 49,
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'grade_letter' => 'F',
                'min_score' => 0,
                'max_score' => 44,
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
