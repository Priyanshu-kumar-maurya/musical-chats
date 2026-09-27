package com.secretbubble.app;

import android.app.Activity;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.MediaMetadata;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.os.Build;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MediaNotificationManager {
    public static final String ACTION_PLAY = "com.secretbubble.app.ACTION_PLAY";
    public static final String ACTION_PAUSE = "com.secretbubble.app.ACTION_PAUSE";
    public static final String ACTION_NEXT = "com.secretbubble.app.ACTION_NEXT";
    public static final String ACTION_PREV = "com.secretbubble.app.ACTION_PREV";
    public static final String ACTION_STOP = "com.secretbubble.app.ACTION_STOP";

    private static final String CHANNEL_ID = "secret_bubble_music_channel";
    private static final int NOTIFICATION_ID = 10086;

    private final Activity activity;
    private final WebView webView;
    private final NotificationManager notificationManager;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    private MediaSession mediaSession;
    private BroadcastReceiver broadcastReceiver;
    private Bitmap cachedArtwork = null;
    private String lastArtworkUrl = "";

    private String currentTitle = "Secret-Bubble Music";
    private String currentArtist = "Online Stream";
    private String currentAlbum = "Stealth Lounge";
    private boolean isCurrentlyPlaying = false;
    private long currentDurationSec = 0;
    private long currentPositionSec = 0;

    public MediaNotificationManager(Activity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
        this.notificationManager = (NotificationManager) activity.getSystemService(Context.NOTIFICATION_SERVICE);

        initNotificationChannel();
        initMediaSession();
        registerBroadcastReceiver();
    }

    private void initNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Music Playback Controls",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Shows playback controls on lock screen and notification shade");
            channel.setShowBadge(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

    private void initMediaSession() {
        try {
            mediaSession = new MediaSession(activity, "SecretBubbleSession");
            mediaSession.setCallback(new MediaSession.Callback() {
                @Override
                public void onPlay() {
                    dispatchAction("play");
                }

                @Override
                public void onPause() {
                    dispatchAction("pause");
                }

                @Override
                public void onSkipToNext() {
                    dispatchAction("next");
                }

                @Override
                public void onSkipToPrevious() {
                    dispatchAction("prev");
                }

                @Override
                public void onSeekTo(long pos) {
                    dispatchActionWithArg("seek", pos / 1000);
                }

                @Override
                public void onStop() {
                    dispatchAction("pause");
                }
            });
            mediaSession.setActive(true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void registerBroadcastReceiver() {
        broadcastReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (intent == null || intent.getAction() == null) return;
                String action = intent.getAction();
                switch (action) {
                    case ACTION_PLAY:
                        dispatchAction("play");
                        break;
                    case ACTION_PAUSE:
                        dispatchAction("pause");
                        break;
                    case ACTION_NEXT:
                        dispatchAction("next");
                        break;
                    case ACTION_PREV:
                        dispatchAction("prev");
                        break;
                    case ACTION_STOP:
                        stopMedia();
                        break;
                }
            }
        };

        IntentFilter filter = new IntentFilter();
        filter.addAction(ACTION_PLAY);
        filter.addAction(ACTION_PAUSE);
        filter.addAction(ACTION_NEXT);
        filter.addAction(ACTION_PREV);
        filter.addAction(ACTION_STOP);

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                activity.registerReceiver(broadcastReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
            } else {
                activity.registerReceiver(broadcastReceiver, filter);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void dispatchAction(String action) {
        if (webView != null) {
            webView.post(() -> {
                String js = "window.dispatchEvent(new CustomEvent('nativeMediaAction', { detail: { action: '" + action + "' } }));";
                webView.evaluateJavascript(js, null);
            });
        }
    }

    public void dispatchActionWithArg(String action, long value) {
        if (webView != null) {
            webView.post(() -> {
                String js = "window.dispatchEvent(new CustomEvent('nativeMediaAction', { detail: { action: '" + action + "', value: " + value + " } }));";
                webView.evaluateJavascript(js, null);
            });
        }
    }

    @JavascriptInterface
    public void updateMedia(String title, String artist, String album, String artworkUrl, boolean isPlaying, double durationSec, double positionSec) {
        this.currentTitle = (title != null && !title.isEmpty()) ? title : "Secret-Bubble Music";
        this.currentArtist = (artist != null && !artist.isEmpty()) ? artist : "Online Stream";
        this.currentAlbum = (album != null && !album.isEmpty()) ? album : "Stealth Lounge";
        this.isCurrentlyPlaying = isPlaying;
        this.currentDurationSec = (long) durationSec;
        this.currentPositionSec = (long) positionSec;

        updateMediaSessionState();

        if (artworkUrl != null && !artworkUrl.isEmpty() && !artworkUrl.equals(lastArtworkUrl)) {
            lastArtworkUrl = artworkUrl;
            executor.execute(() -> {
                Bitmap bmp = downloadBitmap(artworkUrl);
                if (bmp != null) {
                    cachedArtwork = bmp;
                }
                activity.runOnUiThread(this::showNotification);
            });
        } else {
            activity.runOnUiThread(this::showNotification);
        }
    }

    @JavascriptInterface
    public void stopMedia() {
        isCurrentlyPlaying = false;
        if (mediaSession != null) {
            try {
                mediaSession.setActive(false);
            } catch (Exception ignored) {}
        }
        if (notificationManager != null) {
            try {
                notificationManager.cancel(NOTIFICATION_ID);
            } catch (Exception ignored) {}
        }
    }

    private void updateMediaSessionState() {
        if (mediaSession == null) return;
        try {
            long actions = PlaybackState.ACTION_PLAY
                | PlaybackState.ACTION_PAUSE
                | PlaybackState.ACTION_PLAY_PAUSE
                | PlaybackState.ACTION_SKIP_TO_NEXT
                | PlaybackState.ACTION_SKIP_TO_PREVIOUS
                | PlaybackState.ACTION_SEEK_TO;

            PlaybackState.Builder stateBuilder = new PlaybackState.Builder()
                .setActions(actions)
                .setState(
                    isCurrentlyPlaying ? PlaybackState.STATE_PLAYING : PlaybackState.STATE_PAUSED,
                    currentPositionSec * 1000,
                    1.0f
                );
            mediaSession.setPlaybackState(stateBuilder.build());

            MediaMetadata.Builder metaBuilder = new MediaMetadata.Builder()
                .putString(MediaMetadata.METADATA_KEY_TITLE, currentTitle)
                .putString(MediaMetadata.METADATA_KEY_ARTIST, currentArtist)
                .putString(MediaMetadata.METADATA_KEY_ALBUM, currentAlbum)
                .putLong(MediaMetadata.METADATA_KEY_DURATION, currentDurationSec * 1000);

            if (cachedArtwork != null) {
                metaBuilder.putBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART, cachedArtwork);
            }

            mediaSession.setMetadata(metaBuilder.build());
            mediaSession.setActive(true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void showNotification() {
        if (notificationManager == null || activity.isFinishing()) return;

        try {
            int flag = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0;

            // Tap notification opens MainActivity
            Intent openIntent = new Intent(activity, MainActivity.class);
            openIntent.setAction(Intent.ACTION_MAIN);
            openIntent.addCategory(Intent.CATEGORY_LAUNCHER);
            openIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            PendingIntent contentIntent = PendingIntent.getActivity(activity, 0, openIntent, flag);

            // Previous
            Intent prevIntent = new Intent(ACTION_PREV);
            PendingIntent prevPI = PendingIntent.getBroadcast(activity, 1, prevIntent, flag);

            // Play / Pause Toggle
            Intent toggleIntent = new Intent(isCurrentlyPlaying ? ACTION_PAUSE : ACTION_PLAY);
            PendingIntent togglePI = PendingIntent.getBroadcast(activity, 2, toggleIntent, flag);

            // Next
            Intent nextIntent = new Intent(ACTION_NEXT);
            PendingIntent nextPI = PendingIntent.getBroadcast(activity, 3, nextIntent, flag);

            Notification.Builder builder;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                builder = new Notification.Builder(activity, CHANNEL_ID);
            } else {
                builder = new Notification.Builder(activity);
            }

            builder.setContentTitle(currentTitle)
                .setContentText(currentArtist)
                .setSubText(currentAlbum)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(contentIntent)
                .setVisibility(Notification.VISIBILITY_PUBLIC)
                .setOngoing(isCurrentlyPlaying)
                .setShowWhen(false);

            if (cachedArtwork != null) {
                builder.setLargeIcon(cachedArtwork);
            }

            // Add standard media actions
            builder.addAction(android.R.drawable.ic_media_previous, "Previous", prevPI);
            builder.addAction(
                isCurrentlyPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play,
                isCurrentlyPlaying ? "Pause" : "Play",
                togglePI
            );
            builder.addAction(android.R.drawable.ic_media_next, "Next", nextPI);

            // Apply MediaStyle
            if (mediaSession != null) {
                Notification.MediaStyle mediaStyle = new Notification.MediaStyle()
                    .setMediaSession(mediaSession.getSessionToken())
                    .setShowActionsInCompactView(0, 1, 2);
                builder.setStyle(mediaStyle);
            }

            notificationManager.notify(NOTIFICATION_ID, builder.build());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private Bitmap downloadBitmap(String src) {
        try {
            URL url = new URL(src);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setDoInput(true);
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            connection.connect();
            InputStream input = connection.getInputStream();
            return BitmapFactory.decodeStream(input);
        } catch (Exception e) {
            return null;
        }
    }

    public void destroy() {
        try {
            if (broadcastReceiver != null) {
                activity.unregisterReceiver(broadcastReceiver);
                broadcastReceiver = null;
            }
        } catch (Exception ignored) {}

        stopMedia();

        try {
            if (mediaSession != null) {
                mediaSession.release();
                mediaSession = null;
            }
        } catch (Exception ignored) {}

        executor.shutdown();
    }
}
