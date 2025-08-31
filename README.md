# DevOps Lab Starter

Un mini-lab pour pratiquer : Docker → Jenkins → Docker Registry → Helm → Minikube → Grafana/Prometheus (optionnel).

## Prérequis

- Docker Desktop (ou Docker + docker-compose)
- kubectl
- Helm
- Minikube

## Démarrer Jenkins

```bash
cd devops-lab-starter
docker compose up -d
# Récupérer le mot de passe admin
docker exec -it jenkins bash -c 'cat /var/jenkins_home/secrets/initialAdminPassword'
```

Configure Jenkins, installez "Pipeline" et créez un job **Pipeline from SCM** pointant sur ce repo.

## Construire/pousser l'image (local)

Remplacez `REPLACE_WITH_YOUR_DOCKERHUB` dans `Jenkinsfile` et `helm/devops-lab-app/values.yaml` par votre namespace Docker Hub.

Créez un secret d'identifiants Docker Hub dans Jenkins : `dockerhub-creds` (username/password).

## Lancer Minikube

```bash
minikube start
kubectl get nodes
```

Activez l'ingress si besoin :
```bash
minikube addons enable ingress
```

## Déploiement Helm

Le pipeline Jenkins exécutera :
```bash
helm upgrade --install lab ./helm/devops-lab-app   --set image.repository=$REGISTRY/devops-lab-app   --set image.tag=latest
```

Pour accéder au service :
```bash
minikube service lab-devops-lab-app --url
# ou via ingress devops-lab.local si vous mappez /etc/hosts -> $(minikube ip)
```

## Observabilité (optionnel)

Installer le stack communautaire :
```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install kube-prom prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
```

Ajoutez le job scraping sur `/metrics` via ServiceMonitor/PodMonitor (à faire selon votre cluster).

---

**Endpoints app :**
- `/health`
- `/hello`
- `/metrics` (Prometheus format)