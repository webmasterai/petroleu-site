<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class CreateCmsAdmin extends Command
{
    protected $signature = 'cms:create-admin
        {--email= : Admin email}
        {--name=CMS Admin : Admin display name}
        {--password= : Admin password (min 12 chars). Prefer env CMS_ADMIN_PASSWORD}';

    protected $description = 'Create or update the first CMS administrator (password from option or CMS_ADMIN_PASSWORD env)';

    public function handle(): int
    {
        $email = $this->option('email') ?: env('CMS_ADMIN_EMAIL');
        $password = $this->option('password') ?: env('CMS_ADMIN_PASSWORD');
        $name = $this->option('name') ?: env('CMS_ADMIN_NAME', 'CMS Admin');

        if (! $email) {
            $email = $this->ask('Admin email');
        }
        if (! $password) {
            $password = $this->secret('Admin password (min 12 characters)');
        }

        $validator = Validator::make(
            compact('email', 'password', 'name'),
            [
                'email' => 'required|email',
                'password' => 'required|string|min:12',
                'name' => 'required|string|max:255',
            ]
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => $password,
                'role' => 'super_admin',
                'is_active' => true,
                'password_changed_at' => now(),
            ]
        );

        $this->info('CMS Super Admin ready: '.$user->email.' (id '.$user->id.')');
        $this->warn('Password is not stored in source. Do not commit credentials.');

        return self::SUCCESS;
    }
}
