from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='kazakhword',
            name='embedding',
            field=models.JSONField(blank=True, default=None, null=True),
        ),
        migrations.CreateModel(
            name='ContextGameSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('attempts', models.JSONField(default=list)),
                ('solved', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('secret_word', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='context_sessions', to='game.kazakhword')),
            ],
            options={
                'verbose_name': 'Контекст сессиясы',
                'verbose_name_plural': 'Контекст сессиялары',
                'ordering': ['-created_at'],
            },
        ),
    ]
