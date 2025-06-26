<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('performances', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id');
        $table->foreignId('topic_id');
        $table->enum('status', ['In Progress', 'Completed'])->default('In Progress');
        $table->unsignedInteger('attempts')->default(1);
        $table->decimal('last_score', 5, 2)->default(0);
        $table->timestamps();
        $table->unique(['user_id', 'topic_id']); // One progress record per topic per user
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('performances');
    }
};
