name    := `jq -r '.name' package.json`
version := `jq -r '.version' package.json`

test_dir      := justfile_directory() / "test"
cache_dir     := test_dir / "cache"
cache_archive := "cache.tar.gz"

format:
    pnpm run format

lint:
    pnpm run lint

check:
    pnpm run check

test: decompress
    pnpm run test

build:
    pnpm run build

attw:
    pnpm run attw

compress:
    #!/usr/bin/env bash

    cd {{ test_dir }}
    tar -czvf cache.tar.gz cache
    cd -

decompress:
    #!/usr/bin/env bash

    if [ -d "{{ cache_dir }}" ]; then
        exit 0
    fi

    cd {{ test_dir }}
    tar -xzvf cache.tar.gz
    cd -

ci: format lint check test

@pre-publish: ci build attw
    echo "Ready for publishing"

[private]
is-clean:
    #!/usr/bin/env bash

    if [[ -n $(git status --porcelain) ]]; then
        echo "Repository is dirty, commit or stash changes and try again."
        exit 1
    fi

[confirm("Are you sure you want to publish new version of the package?")]
@publish NEW_VERSION: is-clean pre-publish
    echo "Updating {{ name }} from v{{ version }} to v{{ NEW_VERSION }}"
    sed -i 's/"version": "{{ version }}"/"version": "{{ NEW_VERSION }}"/g' package.json jsr.json
    git add package.json jsr.json
    git commit -m "{{ NEW_VERSION }}"
    git tag 'v{{ NEW_VERSION }}'

