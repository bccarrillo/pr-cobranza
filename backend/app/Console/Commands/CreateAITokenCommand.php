<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class CreateAITokenCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:create-token {user_id} {--name=AI_Agent_Token}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new Sanctum API token for an AI Agent to act on behalf of a user/tenant';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->argument('user_id');
        $tokenName = $this->option('name');

        $user = User::find($userId);

        if (!$user) {
            $this->error("User with ID {$userId} not found.");
            return 1;
        }

        $token = $user->createToken($tokenName);

        $this->info("Token created successfully for user: {$user->name} (Tenant: {$user->tenant_id})");
        $this->line("Token: <options=bold,underscore>{$token->plainTextToken}</>");
        $this->warn("Make sure to copy this token now. You won't be able to see it again.");

        return 0;
    }
}
