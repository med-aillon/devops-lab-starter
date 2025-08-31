{{- define "devops-lab-app.name" -}}
{{- .Chart.Name -}}
{{- end -}}

{{- define "devops-lab-app.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}