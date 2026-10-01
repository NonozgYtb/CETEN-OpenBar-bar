package config

import (
	"time"

	"github.com/caarlos0/env/v9"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

type Config struct {
	MongoConfig struct {
		ConnectionURI string `env:"URI" envDefault:"mongodb://localhost:27017"`
		Database      string `env:"DB" envDefault:"bar"`
		Timeout       uint64 `env:"TIMEOUT" envDefault:"30"`
	} `envPrefix:"BAR_MONGO_"`

	ApiConfig struct {
		SessionSecret      string `env:"SESSION_SECRET"`
		AdminSessionSecret string `env:"ADMIN_SESSION_SECRET"`
		Port               string `env:"PORT" envDefault:":8080"`
		BasePath           string `env:"BASE_PATH" envDefault:"http://localhost:8080"`
		FrontendBasePath   string `env:"FRONTEND_BASE_PATH" envDefault:"http://localhost:5173"`
		LocalToken         string `env:"LOCAL_TOKEN"`
	} `envPrefix:"BAR_API_"`

	OauthConfig struct {
		GoogleClientID     string `env:"GOOGLE_CLIENT_ID"`
		GoogleClientSecret string `env:"GOOGLE_CLIENT_SECRET"`
	} `envPrefix:"BAR_OAUTH_"`

	HelloAssoConfig struct {
		URL          string `env:"URL" envDefault:"https://api.helloasso.com"`
		ClientID     string `env:"CLIENT_ID"`
		ClientSecret string `env:"CLIENT_SECRET"`
		Slug         string `env:"SLUG"`
		// Interval between each run of the checkout processing
		CheckoutProcessingInterval time.Duration `env:"CHECKOUT_PROCESSING_INTERVAL" envDefault:"10m"`
	} `envPrefix:"HELLOASSO_"`

	StorageConfig struct {
		StoragePath string `env:"STORAGE_PATH" envDefault:"./storage"`
	} `envPrefix:"BAR_STORAGE_"`
	DiscordWebhookURL string `env:"BAR_DISCORD_WEBHOOK_URL" envDefault:""`
	LogLevel          string `env:"BAR_LOG_LEVEL" envDefault:"info"`

	PathConfig struct {
		AccountPath        string `env:"ACCOUNT_PATH" envDefault:"/borne/mobile"`
		AuthPath           string `env:"AUTH_PATH" envDefault:"/auth"`
		AdminPath          string `env:"ADMIN_PATH" envDefault:"/admin"`
		ClientCommandePath string `env:"CLIENT_COMMAND_PATH" envDefault:"/client/commande"`
		ConnectSuccessPath string `env:"CONNECT_SUCCESS_PATH" envDefault:"/borne/connected"`
		RefillBackPath     string `env:"REFILL_BACK_PATH" envDefault:"/client/index/refill"`
		RefillErrorPath    string `env:"REFILL_ERROR_PATH" envDefault:"/client/index/refill/callback"`
		RefillReturnPath   string `env:"REFILL_RETURN_PATH" envDefault:"/client/index/refill/callback"`
	} `envPrefix:"BAR_PATHS_"`

	ServerConfig struct {
		CertFile *string `env:"CERT_FILE"`
		KeyFile  *string `env:"KEY_FILE"`
	} `envPrefix:"BAR_SERVER_"`
}

var config Config

func GetConfig() Config {
	return config
}

func init() {
	godotenv.Load()
	if err := env.Parse(&config); err != nil {
		logrus.Fatal(err)
	}

	logrus.SetLevel(logrus.InfoLevel)
	switch config.LogLevel {
	case "info":
		logrus.SetLevel(logrus.InfoLevel)
	case "debug":
		logrus.SetLevel(logrus.DebugLevel)
	case "warn":
		logrus.SetLevel(logrus.WarnLevel)
	case "error":
		logrus.SetLevel(logrus.ErrorLevel)
	case "fatal":
		logrus.SetLevel(logrus.FatalLevel)
	case "panic":
		logrus.SetLevel(logrus.PanicLevel)
	case "trace":
		logrus.SetLevel(logrus.TraceLevel)
	}

	// Always add date to logrus
	logrus.SetFormatter(&logrus.TextFormatter{
		FullTimestamp: true,
	})

	logrus.Info("Loaded config.")
}
